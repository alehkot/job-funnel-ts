"use strict";

export type SupportedCrawlers = "linkedin";

export interface CrawlerConfig {
  pages: string[];
  credentials: Record<"username" | "password", string>;
}

// const supportedCrawlers: Set<SupportedCrawlers> = new Set(["linkedin"]);

export interface ConfigYaml {
  crawlers: Record<SupportedCrawlers, CrawlerConfig>;
}
