import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";

const topicSchema = z.object({
  title: z.string(),
  description: z.object({}),
  assetUrl: z.string().array(),
});

const topicController = {
  async createTopic(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await topicSchema.parseAsync(req.body);
      const data = {
        ...resp,
        userId: req.user?.id as string,
      };
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
