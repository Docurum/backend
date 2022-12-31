import { envSchema } from "@v1/schemas";

const config = envSchema.parse(process.env);

export default config;
