import app from "@src/app";
import { envSchema } from "@v1/schemas";
import { ZodError } from "zod";

const startServer = (): void => {
  try {
    const result = envSchema.parse(process.env);
    const PORT: number = result.PORT || 8080;
    app.listen(PORT, () => {
      if (result.NODE_ENV === "development") {
        console.log(`🚀 @ http://localhost:${PORT}`);
      } else {
        console.log(`🚀 @ PORT: ${PORT}`);
      }
    });
  } catch (err) {
    if (err instanceof ZodError) {
      console.log(err.issues);
      console.log("Check .env file!! 🚂");
      return;
    }
    console.log("Error in Starting Server !! 💀");
  }
};

startServer();
