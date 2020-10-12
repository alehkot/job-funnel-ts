"use strict";

import { program } from "commander";
import { scan } from "./commands/scan";
import { exportData } from "./commands/export";
import { wipeData } from "./commands/wipe";

program.version("1.0.0");

program.name("Job Funnel JS");

program.description("Job Funnel JS aggregates jobs openings information from online datasources");

program
  .command("scan")
  .description("scan job websites")
  .option("-s, --sites <sites...>", "supported sites to scan", "linkedin")
  .option("-c, --config <file>", "configuration file", "config.yaml")
  .action((cmdObj) => {
    scan(cmdObj.sites, cmdObj.config);
  });

program
  .command("export")
  .description("export the collected data to XLSX file (Excel)")
  .option("-f, --filename <filename>", "file name", "report.xlsx")
  .action((cmdObj) => {
    exportData(cmdObj.filename);
  });

program
  .command("wipedb")
  .description("wipes the database data")
  .action(() => {
    wipeData();
  });

program.parse(process.argv);
