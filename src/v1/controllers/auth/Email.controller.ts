import prisma from "@src/prisma";
import config from "@src/v1/config";
import { JWTService } from "@src/v1/services";
import { customResponse } from "@v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { TokenExpiredError } from "jsonwebtoken";
import { ZodError, z } from "zod";

const emailConfirmSchema = z
  .object({
    token: z.string().min(1, "Token is missing in URL"),
  })
  .strict();

type emailConfirmParamsType = z.infer<typeof emailConfirmSchema>;

const emailController = {
  async confirm(req: Request<emailConfirmParamsType, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = await emailConfirmSchema.parseAsync(req.params);
      const { aud } = JWTService.decode(token) as { aud: string };
      const { id } = JWTService.verify(token, aud, config.EMAIL_CONFIRM_TOKEN) as { id: string };
      const { isEmailVerified } = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
      });
      if (isEmailVerified) {
        res.send(customResponse(200, "Your email has been already verified !"));
        return;
      }
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          isEmailVerified: true,
        },
      });
      res.send(customResponse(200, "Your email has been successfully verified !"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      if (err instanceof TokenExpiredError) {
        return next({ status: createError.InternalServerError().status, message: "Your email verification link has been expired !" });
      }
      return next({ status: createError.InternalServerError().status, message: "Please ensure that the email verification link is correct !" });
    }
  },
};

export default emailController;
