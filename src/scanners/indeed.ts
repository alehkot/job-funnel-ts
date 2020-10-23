import puppeteer from "puppeteer";
import { promisify } from "util";

import { CrawlerConfig } from "../interfaces/crawler-config";
import { JobCardResult } from "../interfaces/job-cards";

const sleep = promisify(setTimeout);

async function scan(config: CrawlerConfig): Promise<JobCardResult[]> {
  const debugMode = process.env.JOB_FUNNEL_DEBUG === "enabled";

  const browser = await puppeteer.launch({ headless: !debugMode });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1600 });

  await page.goto(
    "https://secure.indeed.com/account/login?hl=en_US&co=US&continue=https%3A%2F%2Fwww.indeed.com%2F&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fwww.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess",
    { waitUntil: "domcontentloaded" },
  );
  await sleep(3000);
  await page.click("#login-email-input");
  await page.keyboard.type(config.credentials.username);
  await page.click("#login-password-input");
  await page.keyboard.type(config.credentials.password);
  await page.click("#login-submit-button");
  await sleep(5000);

  const results: JobCardResult[] = [];

  for (const pageUrl of config.pages) {
    console.log(`Crawling page: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

    // Add artificial delay so that actual page urls can be modified on the fly during debugging.
    await sleep(debugMode ? 20000 : 3000);

    const jobCards = await page.evaluate(
      async (pageUrl, debugMode) => {
        const data: JobCardResult[] = [];

        // Identify all of the job cards in the sidebar.
        const cards = Array.from(document.querySelectorAll(".jobsearch-SerpJobCard"));

        for (const card of cards) {
          (card as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 3000));
          // TODO: Proper exceptions handling
          try {
            const iframeDocument = (document.querySelector("#vjs-container-iframe") as HTMLIFrameElement)
              .contentDocument;

            if (debugMode) console.info("parsing header");
            // Need to delete invisible element
            iframeDocument.querySelector(".jobsearch-JobComponent h1").children[0].remove();
            const title = iframeDocument.querySelector(".jobsearch-JobComponent h1").textContent.trim();

            if (debugMode) console.info("parsing company name");
            let companyName;
            if (iframeDocument.querySelector(".jobsearch-InlineCompanyRating a")) {
              companyName = iframeDocument.querySelector(".jobsearch-InlineCompanyRating a").textContent.trim();
            } else {
              companyName = iframeDocument
                .querySelector(".jobsearch-InlineCompanyRating")
                .children[0].textContent.trim();
            }

            if (debugMode) console.info("parsing company location");
            const location = iframeDocument
              .querySelector(".jobsearch-InlineCompanyRating")
              .lastChild.textContent.trim();

            if (debugMode) console.info("parsing job description location");
            const jobDescription = (iframeDocument.querySelector("#jobDescriptionText") as HTMLElement).innerText
              .trim()
              .replace(/^\n{1,}$/gi, "\n")
              .replace(/[\n]+/gi, ". ")
              .replace(/[^a-zA-Z0-9!-_. ]/gi, "");

            if (debugMode) console.info("parsing job id");
            const jobId = (card as HTMLElement).dataset["jk"];

            data.push({
              createdAt: +new Date(),
              source: "indeed",
              jobId,
              title,
              companyName,
              location,
              jobDescription,
              url: "Unsupported",
              searchPageUrl: pageUrl,
            });
          } catch (err) {
            if (debugMode) {
              console.warn(err);
              console.log("Waiting for 60 seconds...");
              await new Promise((resolve) => setTimeout(resolve, 60000));
            }
          }
        }
        return data;
      },
      pageUrl,
      debugMode,
    );

    results.push(...jobCards);
  }

  await browser.close();
  return results;
}

export default { scan };
