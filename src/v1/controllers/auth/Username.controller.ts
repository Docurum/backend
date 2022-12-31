import { usernameSchema } from "@v1/schemas";
import { successResp } from "@v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { ZodError, z } from "zod";

const usernameExistsSchema = z
  .object({
    username: usernameSchema,
  })
  .strict();

type usernameRequestBodyType = z.infer<typeof usernameExistsSchema>;

const usernameController = {
  async exists(req: Request<{}, {}, usernameRequestBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      await usernameExistsSchema.parseAsync(req.body);
      res.send(successResp(200, "OK"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default usernameController;
