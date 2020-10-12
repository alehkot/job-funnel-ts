"use strict";

export type ExcelRow = {
  createdAt: Date;
  source: string;
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  jobDescription: string;
  url: ExcelRowUrl;
};

export type ExcelRowUrl = {
  text: string;
  hyperlink: string;
  tooltip: string;
};
