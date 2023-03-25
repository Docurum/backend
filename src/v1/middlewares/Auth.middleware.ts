import prisma from "@src/prisma";
import config from "@v1/config";
import { JWTService } from "@v1/services";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { JwtPayload } from "jsonwebtoken";

const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError.Unauthorized());
  }
  /* 0th index is "Bearer" and 1st index is the " JWT Token" */
  const token = authHeader.split(" ")[1];
  try {
    const User = JWTService.decode(token) as JwtPayload;
    const userId = User?.id;
    // console.log("payload:", JWTService.decode(token));
    //  Check if the user exists in DB
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    // console.log("Password: ", user.password);
    JWTService.verify(token, userId, config.USER_ACCESS_SECRET + user.password) as { id: string };
    if (user.blocked) {
      return next(createError.Unauthorized("Your account has been blocked"));
    }
    req.user = user;
    next();
  } catch (err) {
    // console.log("Middleware:", err);
    return next(createError.Unauthorized());
  }
};

export default authMiddleware;
