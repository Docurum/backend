import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";

const commentSchema = z
  .object({
    topicId: z.string(),
    description: z.any().array(),
    assetUrl: z.string().array(),
  })
  .strict();

const commentController = {
  async createComment(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await commentSchema.parseAsync(req.body);
      const data = {
        ...resp,
        userId: req.user?.id as string,
      };
      await prisma.comment.create({ data });
      await prisma.topic.update({
        where: {
          id: req.body.topicId,
        },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });
      res.json(customResponse(201, "Topic created successfully."));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async upvoteComment(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id;
      const upvote = await prisma.upVoteOnComment.findFirst({
        where: {
          commentId,
          userId: req.user?.id,
        },
      });
      const downvote = await prisma.downVoteOnComment.findFirst({
        where: {
          commentId,
          userId: req.user?.id,
        },
      });
      if (downvote !== null) {
        await prisma.downVoteOnComment.delete({
          where: {
            id: downvote.id,
          },
        });
        await prisma.comment.update({
          where: {
            id: commentId,
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
        await prisma.upVoteOnComment.create({
          data: {
            commentId,
            userId: req.user?.id as string,
          },
        });
        await prisma.comment.update({
          where: {
            id: commentId,
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
        res.json(customResponse(200, "Comment Upvoted."));
      }
      if (upvote !== null) {
        res.json(customResponse(200, "Already Upvoted."));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async downvoteComment(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id;
      const upvote = await prisma.upVoteOnComment.findFirst({
        where: {
          commentId,
          userId: req.user?.id,
        },
      });
      const downvote = await prisma.downVoteOnComment.findFirst({
        where: {
          commentId,
          userId: req.user?.id,
        },
      });

      if (upvote !== null) {
        await prisma.upVoteOnComment.delete({
          where: {
            id: upvote.id,
          },
        });
        await prisma.comment.update({
          where: {
            id: commentId,
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
        await prisma.downVoteOnComment.create({
          data: {
            commentId,
            userId: req.user?.id as string,
          },
        });
        await prisma.comment.update({
          where: {
            id: commentId,
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
        res.json(customResponse(200, "Comment Downvoted."));
      }
      if (downvote !== null) {
        res.json(customResponse(200, "Already Downvoted."));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getCommentsByTopicId(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = req.params.id;
      const comments = await prisma.comment.findMany({
        where: {
          topicId,
        },
        select: {
          id: true,
          description: true,
          assetUrl: true,
          upvotes: true,
          downvotes: true,
          views: true,
          shares: true,
          votes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              picture: true,
            },
          },
        },
        take: 10,
      });
      res.json(customResponse(200, comments));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default commentController;
