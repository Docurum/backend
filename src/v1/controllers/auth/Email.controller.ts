import prisma from "@src/prisma";
import config from "@src/v1/config";
import { JWTService } from "@src/v1/services";
import sendForgotPasswordMail from "@src/v1/services/sendForgotPasswordMail";
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

const isEmailPresentSchema = z.string().min(4, "Email must contain at least 4 characters").max(60, "Email must contain at most 60 characters").email("Please enter a valid email").trim();

const forgotPasswordEmailSchema = z
  .object({
    email: isEmailPresentSchema,
  })
  .strict();

type forgotPasswordEmailBodyType = z.infer<typeof forgotPasswordEmailSchema>;

const emailController = {
  async verifyMail(req: Request<emailConfirmParamsType, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = await emailConfirmSchema.parseAsync(req.params);
      const userToken = await prisma.emailTokens.findUniqueOrThrow({
        where: {
          id: token,
        },
      });
      if (userToken.category !== "VERIFYMAIL") {
        throw new Error("Please ensure that the email verification link is correct !");
      }
      const { aud } = JWTService.decode(userToken.token) as { aud: string };
      const { id } = JWTService.verify(userToken.token, aud, config.EMAIL_CONFIRM_TOKEN) as { id: string };
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
  async sendForgotPasswordMail(req: Request<{}, {}, forgotPasswordEmailBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = await forgotPasswordEmailSchema.parseAsync(req.body);
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });
      try {
        const secretKey = config.PASSWORD_RESET_EMAIL_TOKEN + user.password;
        const linkToken = JWTService.sign({ id: user.id, username: user.username }, user.id, "20m", secretKey);
        const userToken = await prisma.emailTokens.create({
          data: {
            category: "RESETPASSWORD",
            token: linkToken,
          },
        });
        const replacements = {
          name: user.name,
          email,
          link: config.FRONTEND_URL + "/reset-password/" + userToken.id,
          year: new Date().getFullYear(),
        };
        const ans = await sendForgotPasswordMail(replacements, email);
        console.log(ans);
      } catch (err: any) {
        console.log("Mail not sent to: " + email);
      }
      res.json(customResponse(200, "Mail Sent Successfully"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default emailController;
