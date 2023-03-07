import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

const loginController = {
  async login(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
  async refresh(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {},
  async logout(req: Request<{}, {}, {}>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies;
      // delete refresh token from db
      await prisma.refreshTokens.delete({
        where: {
          token: refreshToken,
        },
      });
      // delete cookies
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.json(customResponse(200, "Logged Out successfully"));
    } catch (err: any) {
      return next(createError.InternalServerError());
    }
  },
};

export default loginController;
