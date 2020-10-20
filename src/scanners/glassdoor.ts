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

  await page.goto("https://www.glassdoor.com/profile/login_input.htm?userOriginHook=HEADER_SIGNIN_LINK");

  await sleep(3000);

  await page.click("input[name='username']");
  await page.keyboard.type(config.credentials.username);
  await page.click("input[name='password']");
  await page.keyboard.type(config.credentials.password);
  await page.click("button[name='submit']");

  await sleep(3000);

  const results: JobCardResult[] = [];

  for (const pageUrl of config.pages) {
    console.log(`Crawling page: ${pageUrl}`);
    await page.goto(pageUrl);
    // Add artificial delay so that actual page urls can be modified on the fly during debugging.
    await sleep(debugMode ? 20000 : 3000);

    const jobCards = await page.evaluate(
      async (pageUrl, debugMode) => {
        const data: JobCardResult[] = [];

        // Identify all of the job cards in the sidebar.
        const cards = Array.from(document.querySelectorAll(".react-job-listing"));

        for (const card of cards) {
          (card as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Close alarm modal if exists.
          let modal;
          if ((modal = document.querySelector(".SVGInline.modal_closeIcon"))) {
            (modal as HTMLElement).click();
          }

          // TODO: Proper exceptions handling
          try {
            if (debugMode) console.info("parsing header");
            const title = document.querySelector(".jobViewMinimal .empInfo .title").textContent.trim();

            if (debugMode) console.info("parsing company name");
            // Remove rating.
            if (document.querySelector(".jobViewMinimal .empInfo .employerName").children.length) {
              document.querySelector(".jobViewMinimal .empInfo .employerName").children[0].remove();
            }
            const companyName = document.querySelector(".jobViewMinimal .empInfo .employerName").textContent.trim();

            if (debugMode) console.info("parsing company location");
            const location = document.querySelector(".jobViewMinimal .empInfo .location").textContent.trim();

            if (debugMode) console.info("parsing job description location");
            const jobDescription = (document.querySelector(".jobDescriptionContent") as HTMLElement).innerText
              .trim()
              .replace(/^\n{1,}$/gi, "\n")
              .replace(/[\n]+/gi, ". ")
              .replace(/[^a-zA-Z0-9!-_. ]/gi, "");

            if (debugMode) console.info("parsing job id");
            const jobId = (card as HTMLElement).dataset["id"];

            const jobUrl = `https://www.glassdoor.com${card.querySelector("a").getAttribute("href")}`;

            data.push({
              createdAt: +new Date(),
              source: "glassdoor",
              jobId,
              title,
              companyName,
              location,
              jobDescription,
              url: jobUrl,
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
