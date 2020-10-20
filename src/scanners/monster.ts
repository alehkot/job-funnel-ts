import puppeteer from "puppeteer";
import { promisify } from "util";

import { MonsterCrawlerConfig } from "../interfaces/crawler-config";
import { JobCardResult } from "../interfaces/job-cards";

const sleep = promisify(setTimeout);

async function scan(config: MonsterCrawlerConfig): Promise<JobCardResult[]> {
  const debugMode = process.env.JOB_FUNNEL_DEBUG === "enabled";

  const browser = await puppeteer.launch({ headless: !debugMode });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1600 });

  await page.goto("https://www.monster.com/", { waitUntil: "domcontentloaded" });
  await page.click("#monster-npp-signin");
  await sleep(3000);
  await page.click("#email");
  await page.keyboard.type(config.credentials.username);
  await page.click("#password");
  await page.keyboard.type(config.credentials.password);
  await page.click("#btn-login");
  await sleep(5000);

  const results: JobCardResult[] = [];

  for (const pageUrl of config.pages) {
    console.log(`Crawling page: ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

    // Add artificial delay so that actual page urls can be modified on the fly during debugging.
    await sleep(debugMode ? 20000 : 3000);

    // Apply filters.
    if (config.filters.radius || config.filters.posted || config.filters.job_status) {
      await page.click("button#filter-flyout");
      if (config.filters.radius) {
        await page.select("#FilterRadius", `${config.filters.radius}`);
      }
      if (config.filters.posted) {
        await page.select("#FilterPosted", `${config.filters.posted}`);
      }
      if (config.filters.job_status) {
        await page.select("#FilterJobStatus", `${config.filters.job_status}`);
      }
      await page.click("#use-filter-btn");

      await sleep(5000);
    }

    const jobCards = await page.evaluate(
      async (pageUrl, debugMode) => {
        const data: JobCardResult[] = [];

        // Identify all of the job cards in the sidebar.
        const cards = Array.from(document.querySelectorAll(".card-content[data-jobid]"));

        for (const card of cards) {
          (card as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 3000));
          // TODO: Proper exceptions handling
          try {
            if (debugMode) console.info("parsing header");
            if (debugMode) console.info("parsing company name");
            const [title, companyName] = document
              .querySelector("h1.title")
              .textContent.trim()
              .split(/at|from/i)
              .map((e) => e.trim());
            if (debugMode) console.info("parsing company location");
            const location = document.querySelector("h2.subtitle").textContent.trim();
            if (debugMode) console.info("parsing job description location");
            const jobDescription = (document.querySelector("#JobDescription") as HTMLElement).innerText
              .trim()
              .replace(/^\n{1,}$/gi, "\n")
              .replace(/[\n]+/gi, ". ")
              .replace(/[^a-zA-Z0-9!-_. ]/gi, "");

            if (debugMode) console.info("parsing job id");
            const jobId = (document.querySelector("#JobBody") as HTMLElement).dataset["jobId"];
            // const jobId = (card.closest("li") as HTMLElement).dataset["id"];

            data.push({
              createdAt: +new Date(),
              source: "monster",
              jobId,
              title,
              companyName,
              location,
              jobDescription,
              url: window.location.href,
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
