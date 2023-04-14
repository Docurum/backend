import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";

const pictureSchema = z.object({
  picture: z.string(),
});

const doctorSchema = z.object({
  medicalCouncil: z.string(),
  registrationNumber: z.string(),
  registrationYear: z.string(),
  photoId: z.string(), // photoId for verification
  registrationCertificate: z.string(), // Registration Council Certificate
  degreeCertificate: z.string(), // Highest Degree / Diploma certificate
  biography: z.string(),
  qualification: z.string(),
  title: z.string(),
  speciality: z.string().array(),
  experience: z.number(),
  languages: z.string().array(),
  contact: z.string(),
});

const userController = {
  async getUser(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = {
        id: req.user?.id as string,
      };
      const user = await prisma.user.findFirst({
        where: data,
        select: {
          id: true,
          name: true,
          username: true,
          picture: true,
          isDoctor: true,
          dob: true,
          bio: true,
          phoneNumber: true,
          email: true,
          doctor: {
            select: {
              id: true,
              medicalCouncil: true,
              registrationNumber: true,
              degreeCertificate: true,
              biography: true,
              qualification: true,
              title: true,
              speciality: true,
              experience: true,
              languages: true,
              contact: true,
            },
          },
        },
      });
      res.json(customResponse(200, user));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getUserByUsername(req: Request<{ username: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          username,
        },
        select: {
          id: true,
          name: true,
          username: true,
          picture: true,
          isDoctor: true,
        },
      });
      res.json(customResponse(200, user));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getRecommendedUsers(_req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          picture: true,
          isDoctor: true,
        },
        take: 10,
      });
      res.json(customResponse(200, users));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },

  async editUser(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = req.body;
      const query = {
        id: req.user?.id as string,
      };
      const user = await prisma.user.findFirst({
        where: query,
      });
      const data = { ...user, dob: resp.dob, username: resp.username, name: resp.name, bio: resp.bio, phoneNumber: resp.phoneNumber };
      console.log(data);
      await prisma.user.update({
        where: query,
        data,
      });

      res.json(customResponse(200, "User updated successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },

  // write a funciton for edit user

  async updateProfilePicture(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await pictureSchema.parseAsync(req.body);
      const query = {
        id: req.user?.id as string,
      };
      const user = await prisma.user.findFirst({
        where: query,
      });
      const data = { ...user, picture: resp.picture };
      await prisma.user.update({
        where: query,
        data,
      });
      res.json(
        customResponse(200, {
          user,
        })
      );
    } catch (err) {
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },

  async createDoctor(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const resp = await doctorSchema.parseAsync(req.body);
      const data = {
        ...resp,
        userId,
      };

      const doctor = await prisma.doctor.create({ data });
      res.json(
        customResponse(200, {
          doctor,
        })
      );
    } catch (err) {
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default userController;
