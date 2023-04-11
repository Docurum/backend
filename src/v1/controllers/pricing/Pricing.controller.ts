import prisma from "@src/prisma";
import { NextFunction, Request, Response } from "express";
import { customResponse } from "@src/v1/utils/Response.util";
import createError from "http-errors";
import { z } from "zod";

const pricingSchema = z
  .object({
    title: z.string(),
    costPerSession: z.number(),
    numberOfSessions: z.number(),
    durationInMinutes: z.number(),
  })
  .strict();

const pricingController = {
  async createPricing(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await pricingSchema.parseAsync(req.body);
      const data = {
        ...resp,
        userId: req.user?.id as string,
      };
      await prisma.pricing.create({
        data,
      });
      res.json(customResponse(200, "Event Scheduled successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default pricingController;
