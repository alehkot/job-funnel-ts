export type SupportedCrawlers = "linkedin";

export interface CrawlerConfig {
  pages: string[];
  credentials: Record<"username" | "password", string>;
}

export interface ConfigYaml {
  crawlers: Record<SupportedCrawlers, CrawlerConfig>;
}
