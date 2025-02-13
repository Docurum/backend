import { promises as fs } from "fs";
import dotenv from "dotenv";

dotenv.config();

const setEnvValue = async (key: string, value: string): Promise<void> => {
  // read file from hdd & split if from a linebreak to a array
  const ENVS = await fs.readFile("./.env", "utf8");
  const ENV_VARS = ENVS.split("\n");
  // find the env we want based on the key
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => line.match(new RegExp(key))) as string);
  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);
  // write everything back to the file system
  await fs.writeFile("./.env", ENV_VARS.join("\n"));
  console.log(`Updated ${key} to ${value}`);
};

if (process.env.ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, no-template-curly-in-string
  setEnvValue("DATABASE_URL", "${DEV_DB_URL}");
}
