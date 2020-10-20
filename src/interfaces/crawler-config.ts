export type SupportedCrawlers = "linkedin" | "monster" | "glassdoor";

export interface CrawlerConfig {
  pages: string[];
  credentials: Record<"username" | "password", string>;
}

export interface MonsterCrawlerConfig extends CrawlerConfig {
  filters: Record<"radius" | "job_status" | "posted", string>;
}

export interface ConfigYaml {
  crawlers: Record<SupportedCrawlers, CrawlerConfig>;
}
