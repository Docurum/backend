import prisma from "@src/prisma";
import { categoryNameSchema } from "@src/v1/schemas";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z, ZodError } from "zod";

const topicSchema = z.object({
  title: z.string(),
  description: z.any().array(),
  assetUrl: z.string().array(),
  categories: z.string().array(),
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
      await prisma.topic.create({ data });
      res.json(customResponse(201, "Topic created successfully."));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getTopicByUsername(req: Request<{ username: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          username,
        },
      });
      const topics = await prisma.topic.findMany({
        where: {
          userId: user.id,
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          assetUrl: true,
          upvotes: true,
          downvotes: true,
          views: true,
          shares: true,
          votes: true,
          commentCount: true,
          categories: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              picture: true,
              isDoctor: true,
            },
          },
        },
      });
      res.json(customResponse(200, topics));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getTopicByUserId(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      const topics = await prisma.topic.findMany({
        where: {
          userId: user.id,
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          assetUrl: true,
          upvotes: true,
          downvotes: true,
          views: true,
          shares: true,
          votes: true,
          commentCount: true,
          categories: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              picture: true,
              isDoctor: true,
            },
          },
        },
      });
      res.json(customResponse(200, topics));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async upvoteTopic(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.id;
      const upvote = await prisma.upVoteOnTopic.findFirst({
        where: {
          topicId,
          userId: req.user?.id,
        },
      });
      const downvote = await prisma.downVoteOnTopic.findFirst({
        where: {
          topicId,
          userId: req.user?.id,
        },
      });
      if (downvote !== null) {
        await prisma.downVoteOnTopic.delete({
          where: {
            id: downvote.id,
          },
        });
        await prisma.topic.update({
          where: {
            id: topicId,
          },
          data: {
            downvotes: {
              decrement: 1,
            },
            votes: {
              increment: 1,
            },
          },
        });
      }
      if (upvote === null) {
        await prisma.upVoteOnTopic.create({
          data: {
            topicId,
            userId: req.user?.id as string,
          },
        });
        await prisma.topic.update({
          where: {
            id: topicId,
          },
          data: {
            upvotes: {
              increment: 1,
            },
            votes: {
              increment: 1,
            },
          },
        });
        res.json(customResponse(200, "Topic Upvoted."));
      }
      if (upvote !== null) {
        res.json(customResponse(200, "Already Upvoted."));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async downvoteTopic(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.id;
      const upvote = await prisma.upVoteOnTopic.findFirst({
        where: {
          topicId,
          userId: req.user?.id,
        },
      });
      const downvote = await prisma.downVoteOnTopic.findFirst({
        where: {
          topicId,
          userId: req.user?.id,
        },
      });

      if (upvote !== null) {
        await prisma.upVoteOnTopic.delete({
          where: {
            id: upvote.id,
          },
        });
        await prisma.topic.update({
          where: {
            id: topicId,
          },
          data: {
            upvotes: {
              decrement: 1,
            },
            votes: {
              decrement: 1,
            },
          },
        });
      }
      if (downvote === null) {
        await prisma.downVoteOnTopic.create({
          data: {
            topicId,
            userId: req.user?.id as string,
          },
        });
        await prisma.topic.update({
          where: {
            id: topicId,
          },
          data: {
            downvotes: {
              increment: 1,
            },
            votes: {
              decrement: 1,
            },
          },
        });
        res.json(customResponse(200, "Topic Downvoted."));
      }
      if (downvote !== null) {
        res.json(customResponse(200, "Already Downvoted."));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async searchTopicsByNameAndDescription(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.body.name === null) {
        const topics = await prisma.topic.findMany({
          take: 10,
        });
        res.json(customResponse(200, topics));
      }
      const topicName = req.body.name;
      const categories = req.body.categories as string[];
      if (topicName !== null) {
        const topics = await prisma.topic.findMany({
          where: {
            title: {
              contains: topicName,
              mode: "insensitive",
            },
            categories: {
              hasEvery: categories,
            },
          },
          orderBy: [
            {
              updatedAt: "desc",
            },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            assetUrl: true,
            upvotes: true,
            downvotes: true,
            views: true,
            shares: true,
            votes: true,
            commentCount: true,
            categories: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                picture: true,
                isDoctor: true,
              },
            },
          },
        });
        res.json(customResponse(200, topics));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getTopicsById(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.id;
      const topic = await prisma.topic.findUniqueOrThrow({
        where: {
          id: topicId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          assetUrl: true,
          upvotes: true,
          downvotes: true,
          views: true,
          shares: true,
          votes: true,
          commentCount: true,
          categories: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              picture: true,
              isDoctor: true,
            },
          },
        },
      });
      res.json(customResponse(200, topic));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async createCategory(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await categorySchema.parseAsync(req.body);
      const userId = req.user?.id as string;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      if (!user.isAdmin) {
        res.json(customResponse(200, "Only verified doctors and admins can create new categories"));
      }
      if (user.isAdmin) {
        const data = {
          ...resp,
          name: resp.name.toLowerCase(),
        };
        await prisma.category.create({ data });
        res.json(customResponse(201, "Category created successfully."));
      }
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
