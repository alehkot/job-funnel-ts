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
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1900, height: 1600 });

  await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: "domcontentloaded" });
  await page.click(LINKEDIN_EMAIL_SELECTOR);
  await page.keyboard.type(config.credentials.username);
  await page.click(LINKEDIN_PASSWORD_SELECTOR);
  await page.keyboard.type(config.credentials.password);
  await page.click(LINKEDIN_SUBMIT_SELECTOR);

  for (const pageUrl of config.pages) {
    await page.goto(pageUrl);
    await sleep(3000);
    const jobCards = await page.evaluate(async () => {
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
          const title = document.querySelector(".details-pane__content h2").textContent.trim();
          const companyName = document
            .querySelector("a[data-tracking-control-name='public_jobs_topcard_org_name']")
            .textContent.trim();
          const location = document
            .querySelector("a[data-tracking-control-name='public_jobs_topcard_org_name']")
            .closest("span")
            .nextSibling.textContent.trim();
          const jobDescription = (document.querySelector(
            ".description .show-more-less-html__markup",
          ) as HTMLElement).innerText
            .trim()
            .replace(/^\n{1,}$/gi, "\n")
            .replace(/[\n]+/gi, ". ")
            .replace(/[^a-zA-Z0-9!-_. ]/gi, "");

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
          });
        } catch (err) {}
      }
      return data;
    });
    await browser.close();
    return jobCards;
  }
}

export default { scan };
