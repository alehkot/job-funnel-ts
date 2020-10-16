export type ExcelRow = {
  createdAt: string;
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
