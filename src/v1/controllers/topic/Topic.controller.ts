import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

const topicController = {
  async register(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body);
      const data = req.body;
      const topic = await prisma.topic.create({ data });
      res.json(
        customResponse(201, {
          topic,
        })
      );
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default topicController;
