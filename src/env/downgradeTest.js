const fs = require("fs").promises;

const setEnvValue = async (key, value) => {
  // read file from hdd & split if from a linebreak to a array
  const ENVS = await fs.readFile("./.env", "utf8");
  const ENV_VARS = ENVS.split("\n");
  // find the env we want based on the key
  const target = ENV_VARS.indexOf(ENV_VARS.find((line) => line.match(new RegExp(key))));
  // replace the key/value with the new value
  ENV_VARS.splice(target, 1, `${key}=${value}`);
  // write everything back to the file system
  await fs.writeFile("./.env", ENV_VARS.join("\n"));
  console.log(`${key}=${value}`);
};

setEnvValue("DATABASE_URL", "${DEV_DB_URL}");
