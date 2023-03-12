import prisma from "@src/prisma";
import config from "@src/v1/config";
import { JWTService } from "@src/v1/services";
import { customResponse } from "@src/v1/utils/Response.util";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import ms from "ms";
import { ZodError, z } from "zod";

const usernameSchema = z
  .string()
  .min(4, "Username must contain at least 4 characters")
  .max(20, "Username must contain at most 20 characters")
  // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
  .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm, "Only A-Z, a-z, . and _ is allowed in Username")
  .trim()
  .transform((username) => username.toLocaleLowerCase());

const emailSchema = z.string().min(4, "Email must contain at least 4 characters").max(60, "Email must contain at most 60 characters").email("Please enter a valid email").trim();

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(50, "Password must contain at most 50 characters")
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.")
  .trim();

const loginSchema = z
  .object({
    emailOrUsername: z.union([usernameSchema, emailSchema]),
    password: passwordSchema,
  })
  .strict();

type loginBodyType = z.infer<typeof loginSchema>;

const loginController = {
  async login(req: Request<{}, {}, loginBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailOrUsername, password } = await loginSchema.parseAsync(req.body);
      let user;
      try {
        user = await prisma.user.findUniqueOrThrow({
          where: {
            email: emailOrUsername,
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            password: true,
            isEmailVerified: true,
            isAdmin: true,
            picture: true,
            dob: true,
            isDoctor: true,
            doctor: true,
            createdAt: true,
          },
        });
      } catch (err: any) {
        try {
          user = await prisma.user.findUniqueOrThrow({
            where: {
              username: emailOrUsername,
            },
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              password: true,
              isEmailVerified: true,
              isAdmin: true,
              picture: true,
              dob: true,
              isDoctor: true,
              doctor: true,
              createdAt: true,
            },
          });
        } catch (err: any) {}
      }
      if (!user) {
        return next(createError.Unauthorized("Verify your Credentials"));
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return next(createError.Unauthorized("Verify your Credentials"));
      }
      const Pass = user.password;
      delete (user as Partial<typeof user>).password;
      const accessToken = JWTService.sign(user, user.id, "30m", config.USER_ACCESS_SECRET + Pass);
      const refreshToken = JWTService.sign(user, user.id, "12h", config.USER_REFRESH_SECRET + Pass);
      await prisma.refreshTokens.create({
        data: {
          token: refreshToken,
          userId: user.id,
        },
      });
      res.cookie("accessToken", accessToken, {
        maxAge: ms("30m"),
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: ms("12h"),
        httpOnly: true,
      });
      res.json(customResponse(200, { accessToken, refreshToken }));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
  async refresh(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: refreshTokenFromCookie } = req.cookies;
      const refreshTokenSchema = z.string().min(1, "Refresh Token is missing");
      const sanitizedRefreshToken = await refreshTokenSchema.parseAsync(refreshTokenFromCookie);
      const { id } = JWTService.decode(sanitizedRefreshToken) as { id: string };
      JWTService.verify(sanitizedRefreshToken, id, config.USER_REFRESH_SECRET);
      const refreshTokenExists = await prisma.user.findMany({
        where: {
          AND: [
            { id },
            {
              refreshToken: {
                every: {
                  token: sanitizedRefreshToken,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          password: true,
          isEmailVerified: true,
          isAdmin: true,
          picture: true,
          dob: true,
          isDoctor: true,
          doctor: true,
          createdAt: true,
        },
      });
      if (refreshTokenExists.length !== 1) {
        return next(createError.Unauthorized("Refresh Token is Invalid"));
      }
      const Pass = refreshTokenExists[0].password;
      delete (refreshTokenExists[0] as Partial<typeof refreshTokenExists[0]>).password;
      try {
        await prisma.refreshTokens.delete({
          where: {
            token: sanitizedRefreshToken,
          },
        });
      } catch (err: any) {
        console.log("Unable to delete Refresh Token");
      }
      const accessToken = JWTService.sign(refreshTokenExists[0], id, "30m", config.USER_ACCESS_SECRET + Pass);
      const refreshToken = JWTService.sign(refreshTokenExists[0], id, "12h", config.USER_REFRESH_SECRET + Pass);
      await prisma.refreshTokens.create({
        data: {
          token: refreshToken,
          userId: id,
        },
      });
      res.cookie("accessToken", accessToken, {
        maxAge: ms("30m"),
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: ms("12h"),
        httpOnly: true,
      });
      res.json(customResponse(200, { accessToken, refreshToken }));
    } catch (err: any) {
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
  async logout(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      await prisma.refreshTokens.delete({
        where: {
          token: refreshToken,
        },
      });
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.json(customResponse(200, "Logged Out successfully"));
    } catch (err: any) {
      return next(createError.InternalServerError());
    }
  },
};

export default loginController;
