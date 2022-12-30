import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { ZodError, z } from "zod";
import { registerSchema } from "../schemas";

type registerRequestBodyType = z.infer<typeof registerSchema>;

const registerController = {
  async register(req: Request<{}, {}, registerRequestBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = registerSchema.parse(req.body);
      res.status(201).json(resp);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default registerController;
