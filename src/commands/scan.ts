import YAML from "yaml";
import fs from "fs";

import linkedin from "../scanners/linkedin";
import { ConfigYaml } from "../interfaces/crawler-config";
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
    if (site === "linkedin") {
      results.push(processResults(linkedin.scan(config.crawlers.linkedin)));
    }
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
