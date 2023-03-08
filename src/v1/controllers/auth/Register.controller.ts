import prisma from "@src/prisma";
import config from "@src/v1/config";
import { JWTService, sendVerifyMail } from "@src/v1/services";
import { registerSchema } from "@v1/schemas";
import { customResponse } from "@v1/utils/Response.util";
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
      const hashedPassword = await bcrypt.hash(resp.password, config.PASSWORD_SALT_ROUNDS);
      const data: respType = { ...(resp as respType), password: hashedPassword };
      const { id, username } = await prisma.user.create({ data });
      try {
        const linkToken = JWTService.sign({ id, username }, id, "24h", config.EMAIL_CONFIRM_SECRET);
        const userToken = await prisma.emailTokens.create({
          data: {
            category: "VERIFYMAIL",
            token: linkToken,
          },
        });
        const replacements = {
          name: resp.name,
          email: resp.email,
          link: config.FRONTEND_URL + "/email-confirm/" + userToken.id,
          year: new Date().getFullYear(),
        };
        const ans = await sendVerifyMail(replacements, resp.email);
        console.log(ans);
      } catch (err: any) {
        console.log("Mail not sent to: " + resp.email);
      }
      res.status(201).json(customResponse(201, "User Registered Successfully"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default registerController;
