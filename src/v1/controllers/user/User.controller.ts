import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

const userController = {
  async getUser(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.user);
      console.log(req.body);
      const data = {
        id: req.user?.id as string,
      };
      const user = await prisma.user.findFirst({
        where: data,
      });
      res.json(
        customResponse(200, {
          user,
        })
      );
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default userController;
