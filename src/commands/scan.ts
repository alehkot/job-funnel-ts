import YAML from "yaml";
import fs from "fs";

import linkedin from "../scanners/linkedin";
import monster from "../scanners/monster";
import glassdoor from "../scanners/glassdoor";
import indeed from "../scanners/indeed";
import { ConfigYaml, MonsterCrawlerConfig } from "../interfaces/crawler-config";
import { JobCardResult } from "../interfaces/job-cards";
import { db } from "../db";

async function scan(sites: string[] | string, configFile: string): Promise<void> {
  let config: ConfigYaml;
  try {
    const configRaw = YAML.parse(fs.readFileSync(configFile).toString());
    if (!isValidConfig(configRaw)) {
      throw new Error("Invalid configuration file");
    }
    config = configRaw;
  } catch (err) {
    throw err;
  }

  const normSites: string[] = Array.isArray(sites) ? sites : [sites];

  const results = [];
  for (const site of normSites) {
    let resultsPromises: Promise<JobCardResult[]>;

    switch (site) {
      case "linkedin":
        resultsPromises = linkedin.scan(config.crawlers.linkedin);
        break;
      case "monster":
        resultsPromises = monster.scan(config.crawlers.monster as MonsterCrawlerConfig);
        break;
      case "glassdoor":
        resultsPromises = glassdoor.scan(config.crawlers.glassdoor);
        break;
      case "indeed":
        resultsPromises = indeed.scan(config.crawlers.indeed);
        break;
      default:
        throw new Error("Unsupported crawler");
    }

    results.push(processResults(resultsPromises));
  }

  await Promise.all(results);
}

function getjobCardPk(jobCard: JobCardResult): string {
  return `${jobCard.source}-${jobCard.jobId}`;
}

async function processResults(jobCardsPromise: Promise<JobCardResult[]>) {
  const jobCards = await jobCardsPromise;
  for (const jobCard of jobCards) {
    const pk = getjobCardPk(jobCard);
    if (!(await db.exists(pk))) {
      await db.put(pk, jobCard);
    }
  }
}

function isValidConfig(data: Record<string, unknown>): boolean {
  return typeof data.crawlers === "object";
}

export { scan };
