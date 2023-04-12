import prisma from "@src/prisma";
import { NextFunction, Request, Response } from "express";
import { customResponse } from "@src/v1/utils/Response.util";
import createError from "http-errors";
import { z } from "zod";

const pricingSchema = z
  .object({
    title: z.string().min(3),
    costPerSession: z.number().min(3),
    numberOfSessions: z.number().min(1),
    durationInMinutes: z.number().min(5),
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
      res.json(customResponse(200, "Pricing created successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getPricing(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const pricings = await prisma.pricing.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          title: true,
          costPerSession: true,
          durationInMinutes: true,
          numberOfSessions: true,
        },
      });
      res.json(customResponse(200, pricings));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getPricingByUsername(req: Request<{ username: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username;
      const pricings = await prisma.pricing.findMany({
        where: {
          user: {
            username,
          },
        },
        select: {
          id: true,
          title: true,
          costPerSession: true,
          durationInMinutes: true,
          numberOfSessions: true,
        },
      });
      res.json(customResponse(200, pricings));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async editPricing(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const pricingId = req.params.id;
      const userId = req.user?.id as string;
      const resp = await pricingSchema.parseAsync(req.body);
      const data = {
        ...resp,
        userId: req.user?.id as string,
      };
      const pricing = await prisma.pricing.findUniqueOrThrow({
        where: {
          id: pricingId,
        },
      });
      if (pricing.userId === userId) {
        await prisma.pricing.update({
          where: {
            id: pricingId,
          },
          data,
        });
      }
      res.json(customResponse(200, "Pricing updated successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async deletePricing(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const pricingId = req.params.id;
      const userId = req.user?.id as string;
      const pricing = await prisma.pricing.findUniqueOrThrow({
        where: {
          id: pricingId,
        },
      });
      if (pricing.userId === userId) {
        await prisma.pricing.delete({
          where: {
            id: pricingId,
          },
        });
      }
      res.json(customResponse(200, "Pricing deleted successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default pricingController;
