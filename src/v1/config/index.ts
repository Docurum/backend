import { envSchema } from "../schemas";

const config = envSchema.parse(process.env);

export default config;
