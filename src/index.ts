#!/usr/bin/env node

import { program } from "commander";
import { scan } from "./commands/scan";
import { exportData } from "./commands/export";
import { wipeData } from "./commands/wipe";
import { generateLocalConfig } from "./commands/generate-config";
import { version } from "../package.json";

program
  .version(version)
  .name("Job Funnel JS")
  .description("Job Funnel JS aggregates jobs openings information from online datasources")
  .option("-d, --debug", "debug mode")
  .on("option:debug", function () {
    process.env.JOB_FUNNEL_DEBUG = "enabled";
    console.log("Using debug mode");
  });

program
  .command("scan")
  .description("scan job websites")
  .option(
    "-s, --sites <sites...>",
    "supported sites to scan (options: linkedin, glassdoor, indeed, monster)",
    "linkedin",
  )
  .option("-c, --config <file>", "configuration file", "config.yml")
  .action((cmdObj) => {
    scan(cmdObj.sites, cmdObj.config).then(() => {
      console.log("Done");
    });
  });

program
  .command("export")
  .description("export the collected data to XLSX file (Excel)")
  .option("-f, --filename <filename>", "file name", "report.xlsx")
  .action((cmdObj) => {
    exportData(cmdObj.filename).then(() => {
      console.log("Done");
    });
  });

program
  .command("wipe-db")
  .description("wipes the database data")
  .action(() => {
    wipeData().then(() => {
      console.log("Done");
    });
  });

program
  .command("generate-config")
  .description("generate config.yaml file locally")
  .action(() => {
    generateLocalConfig().then(() => {
      console.log("Done");
    });
  });

program.parse(process.argv);
