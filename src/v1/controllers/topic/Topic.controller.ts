import prisma from "@src/prisma";
import { categoryNameSchema } from "@src/v1/schemas";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z, ZodError } from "zod";

const topicSchema = z.object({
  title: z.string(),
  description: z.object({}),
  assetUrl: z.string().array(),
});

const categorySchema = z
  .object({
    name: z.string(),
    imageUrl: z.string(),
    color: z.string(),
  })
  .strict();

const categorynameExistsSchema = z
  .object({
    name: categoryNameSchema,
  })
  .strict();

type categoryRequestBodyType = z.infer<typeof categorynameExistsSchema>;

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
  async categoryExists(req: Request<{}, {}, categoryRequestBodyType>, res: Response, next: NextFunction): Promise<void> {
    try {
      await categorynameExistsSchema.parseAsync(req.body);
      res.send(customResponse(200, "OK"));
    } catch (err) {
      console.log("Error: ", err);
      if (err instanceof ZodError) {
        return next({ status: createError.InternalServerError().status, message: err.issues });
      }
      return next(createError.InternalServerError());
    }
  },
};

export default topicController;
