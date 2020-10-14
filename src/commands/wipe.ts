import { db } from "../db";

export async function wipeData(): Promise<void> {
  for await (const item of db.iterate()) {
    await db.del(item.key);
  }
}
