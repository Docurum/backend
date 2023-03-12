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
    // const { audience } = JWTService.decode(token) as { audience: string };
    // Checks the validity of the "Token"
    // const payload = JWTService.decode(token)?.toString() as string;
    const User = JWTService.decode(token) as JwtPayload;
    const userId = User?.id;
    console.log("payload:", JWTService.decode(token));
    const { id } = JWTService.verify(token, userId, config.USER_ACCESS_SECRET) as { id: string };
    //  Check if the user exists in DB
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (user.blocked) {
      return next(createError.Unauthorized("Your account has been blocked"));
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("Middleware:", err);
    return next(createError.Unauthorized());
  }
};

export default authMiddleware;
