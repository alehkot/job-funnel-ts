interface DBRow {
  id: string;
  createdAt: string;
  source: string;
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  jobDescription: string;
  url: string;
  searchPageUrl: string;
}

interface IGetDb {
  _instance: unknown;
  getAll(): Promise<DBRow[]>;
  insertRow(row: DBRow): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  wipeData(): Promise<boolean>;
}

export { DBRow, IGetDb };
