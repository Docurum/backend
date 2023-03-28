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

const categorySchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  animation: z.object({}),
  color: z.string(),
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
  async createCategory(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await categorySchema.parseAsync(req.body);
      const data = {
        ...resp,
        name: resp.name.toLowerCase(),
      };
      await prisma.category.create({ data });
      res.json(customResponse(201, "Category created successfully."));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getCategories(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryIds = req.body.id; // here id is a list of categories
      const transactions: any[] = [];
      categoryIds.forEach((cat: string) => {
        const tx = prisma.category.findUniqueOrThrow({
          where: {
            id: cat,
          },
        });
        transactions.push(tx);
      });
      const categoryList = await prisma.$transaction(transactions);
      res.json(customResponse(200, categoryList));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async searchCategoriesByName(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryName = req.body.name.toLowerCase(); // here name contains category name searched
      console.log(categoryName);
      if (categoryName === null) {
        const categories = await prisma.category.findMany({
          take: 10,
        });
        res.json(customResponse(200, categories));
      } else if (categoryName !== null) {
        const categories = await prisma.category.findMany({
          where: {
            name: {
              contains: categoryName,
            },
          },
        });
        res.json(customResponse(200, categories));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default topicController;
