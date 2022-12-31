import prisma from "@src/prisma";
import { registerSchema } from "@v1/schemas";
import { successResp } from "@v1/utils/Response.util";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { ZodError, z } from "zod";

type registerRequestBodyType = z.infer<typeof registerSchema>;

const registerController = {
  async register(req: Request<{}, {}, registerRequestBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await registerSchema.parseAsync(req.body);
      type respType = Omit<registerRequestBodyType, "confirmPassword"> & Partial<Pick<registerRequestBodyType, "confirmPassword">>;
      delete (resp as respType).confirmPassword;
      /* Hash the password with 10 salt rounds */
      const hashedPassword = await bcrypt.hash(resp.password, 10);
      const data: respType = { ...(resp as respType), password: hashedPassword };
      await prisma.user.create({ data });
      res.status(201).json(successResp(201, "User Registered Successfully"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default registerController;
