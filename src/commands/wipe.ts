import { getDb } from "../db";

export async function wipeData(): Promise<void> {
  const db = await getDb();
  await db.wipeData();
}
