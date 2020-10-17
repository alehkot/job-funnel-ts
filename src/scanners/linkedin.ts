import puppeteer from "puppeteer";
import { promisify } from "util";

import { CrawlerConfig } from "../interfaces/crawler-config";
import { JobCardResult } from "../interfaces/job-cards";

const sleep = promisify(setTimeout);

const LINKEDIN_EMAIL_SELECTOR = "#username";
const LINKEDIN_PASSWORD_SELECTOR = "#password";
const LINKEDIN_SUBMIT_SELECTOR = "#app__container > main > div > form > div.login__form_action_container > button";
const LINKEDIN_LOGIN_URL = "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";

async function scan(config: CrawlerConfig): Promise<JobCardResult[]> {
  const debugMode = process.env.JOB_FUNNEL_DEBUG === "enabled";

  const browser = await puppeteer.launch({ headless: !debugMode });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1600 });

  await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: "domcontentloaded" });
  await page.click(LINKEDIN_EMAIL_SELECTOR);
  await page.keyboard.type(config.credentials.username);
  await page.click(LINKEDIN_PASSWORD_SELECTOR);
  await page.keyboard.type(config.credentials.password);
  await page.click(LINKEDIN_SUBMIT_SELECTOR);

  const results: JobCardResult[] = [];

  for (const pageUrl of config.pages) {
    console.log(`Crawling page: ${pageUrl}`);
    await page.goto(pageUrl);
    // Add artificial delay so that actual page urls can be modified on the fly during debugging.
    await sleep(debugMode ? 20000 : 3000);

    const jobCards = await page.evaluate(
      async (pageUrl, debugMode) => {
        const data: JobCardResult[] = [];

        // Scroll to the bottom.
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 1000);
        });

        // Identify all of the job cards in the sidebar.
        const cards = Array.from(document.querySelectorAll("a.result-card__full-card-link"));

        for (const card of cards) {
          (card.closest("li") as HTMLElement).click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // TODO: Proper exceptions handling
          try {
            if (debugMode) console.info("parsing header");
            const title = document.querySelector(".details-pane__content h2").textContent.trim();
            if (debugMode) console.info("parsing company name");
            const companyName = document.querySelector("h3.topcard__flavor-row .topcard__flavor").textContent.trim();
            if (debugMode) console.info("parsing company location");
            const location = document
              .querySelector("h3.topcard__flavor-row .topcard__flavor")
              .nextSibling.textContent.trim();
            if (debugMode) console.info("parsing job description location");
            const jobDescription = (document.querySelector(
              ".description .show-more-less-html__markup",
            ) as HTMLElement).innerText
              .trim()
              .replace(/^\n{1,}$/gi, "\n")
              .replace(/[\n]+/gi, ". ")
              .replace(/[^a-zA-Z0-9!-_. ]/gi, "");

            if (debugMode) console.info("parsing job id");
            const jobId = (card.closest("li") as HTMLElement).dataset["id"];

            data.push({
              createdAt: +new Date(),
              source: "linkedin",
              jobId,
              title,
              companyName,
              location,
              jobDescription,
              url: `https://www.linkedin.com/jobs/view/${jobId}`,
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
