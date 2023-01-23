import prisma from "@src/prisma";
import config from "@src/v1/config";
import { passwordSchema } from "@src/v1/schemas";
import { JWTService } from "@src/v1/services";
import { customResponse } from "@src/v1/utils/Response.util";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { TokenExpiredError } from "jsonwebtoken";
import { ZodError, z } from "zod";

const tokenExistsSchema = z
  .object({
    token: z.string().min(1, "Token is missing in URL"),
  })
  .strict();

type tokenExistsParamsType = z.infer<typeof tokenExistsSchema>;

const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Token is missing in URL"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .strict()
  .refine(
    ({ confirmPassword, password }) => {
      return confirmPassword === password;
    },
    {
      path: ["confirmPassword"],
      message: "Passwords don't match",
    }
  );

type passwordResetBodyType = z.infer<typeof passwordResetSchema>;

const passwordController = {
  async tokenExists(req: Request<tokenExistsParamsType, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = await tokenExistsSchema.parseAsync(req.params);
      const userToken = await prisma.emailTokens.findUniqueOrThrow({
        where: {
          id: token,
        },
      });
      if (userToken.category !== "RESETPASSWORD") {
        throw new Error("Please ensure that the password reset link is correct !");
      }
      const { aud } = JWTService.decode(userToken.token) as { aud: string };
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: aud,
        },
      });
      const secretKey = config.PASSWORD_RESET_EMAIL_TOKEN + user.password;
      JWTService.verify(userToken.token, aud, secretKey);
      res.send(customResponse(200, "OK"));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      if (err instanceof TokenExpiredError) {
        return next({ status: createError.InternalServerError().status, message: "Your password reset link has been expired !" });
      }
      return next({ status: createError.InternalServerError().status, message: "Please ensure that the password reset link is correct !" });
    }
  },
  async reset(req: Request<{}, {}, passwordResetBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = await passwordResetSchema.parseAsync(req.body);
      const userToken = await prisma.emailTokens.findUniqueOrThrow({
        where: {
          id: token,
        },
      });
      if (userToken.category !== "RESETPASSWORD") {
        throw new Error("Please ensure that the password reset link is correct !");
      }
      const { aud } = JWTService.decode(userToken.token) as { aud: string };
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: aud,
        },
      });
      const secretKey = config.PASSWORD_RESET_EMAIL_TOKEN + user.password;
      JWTService.verify(userToken.token, aud, secretKey);
      const currPasswordMatched = await bcrypt.compare(password, user.password);
      if (currPasswordMatched) {
        throw new ZodError([{ code: z.ZodIssueCode.custom, path: ["password"], message: "New Password cannot be the same as your Current Password" }]);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: {
          id: aud,
        },
        data: {
          password: hashedPassword,
        },
      });
      try {
        await prisma.emailTokens.delete({
          where: {
            id: token,
          },
        });
      } catch (err: any) {
        console.log("Cannot delete email token: " + token);
      }
      res.send(customResponse(200, "Password Updated Successfully"));
    } catch (err: any) {
      console.log(err);
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      if (err instanceof TokenExpiredError) {
        return next({ status: createError.InternalServerError().status, message: "Your password reset link has been expired !" });
      }
      return next({ status: createError.InternalServerError().status, message: "Please ensure that the password reset link is correct !" });
    }
  },
};

export default passwordController;
