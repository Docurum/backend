import prisma from "@src/prisma";
import config from "@src/v1/config";
import { JWTService } from "@src/v1/services";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import ms from "ms";
import { ZodError, z } from "zod";

const loginController = {
  async login(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
  async refresh(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken: refreshTokenFromCookie } = req.cookies;
      const refreshTokenSchema = z.string().min(1, "Refresh Token is missing");
      const sanitizedRefreshToken = await refreshTokenSchema.parseAsync(refreshTokenFromCookie);
      const { id } = (await JWTService.decode(sanitizedRefreshToken)) as { id: string };
      await JWTService.verify(sanitizedRefreshToken, id, config.USER_REFRESH_SECRET);
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
        throw new Error("Refresh Token is Invalid");
      }
      try {
        await prisma.refreshTokens.delete({
          where: {
            token: sanitizedRefreshToken,
          },
        });
      } catch (err: any) {
        console.log("Unable to delete Refresh Token");
      }
      const accessToken = JWTService.sign(refreshTokenExists[0], id, "30m", config.USER_ACCESS_SECRET);
      const refreshToken = JWTService.sign(refreshTokenExists[0], id, "12h", config.USER_REFRESH_SECRET);
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
      res.json(customResponse(200, "Refresh Token updated"));
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
