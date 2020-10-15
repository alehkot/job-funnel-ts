import { copyFile, access } from "fs/promises";
import path from "path";

export async function generateLocalConfig(): Promise<void> {
  const configPath = path.join(path.resolve(), "./config.yml");
  try {
    await access(configPath);
    console.error("Config already exists");
    return;
  } catch {}

  const configTemplatePath = path.join(__dirname, "../../config.yaml.sample");
  await copyFile(configTemplatePath, path.join(path.resolve(), "./config.yml"));
}
