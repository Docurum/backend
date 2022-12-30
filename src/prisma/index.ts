import { PrismaClient } from "@prisma/client";
import config from "src/v1/config";
import { z } from "zod";

// TODO: isNeeded ?

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

const result = nodeEnvSchema.safeParse(config.NODE_ENV);

const dbURL = {
  development: config.DEV_DB_URL,
  test: config.TEST_DB_URL,
  production: config.PROD_DB_URL,
} as const;

let prisma = new PrismaClient({ log: ["warn", "error"] });

if (result.success) {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbURL[result.data],
      },
    },
    log: ["warn", "error"],
  });
}

export default prisma;
