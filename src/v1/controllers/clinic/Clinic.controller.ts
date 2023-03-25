import prisma from "@src/prisma";
import { emailSchema } from "@src/v1/schemas";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";

const clinicSchema = z
  .object({
    name: z.string().min(4, "Name must contain at least 4 characters").max(150, "Name must contain at most 150 characters").trim(),
    email: emailSchema,
    phoneNumber: z.string(),
    type: z.string(),
    address: z.string().min(5, "Adrress must contain minimum 5 letters"),
    country: z.string().min(2, "Country must contain minimum 2 letters"),
    pincode: z.string(),
    state: z.string().min(2, "State must contain minimum 2 letters"),
    city: z.string().min(5, "City must contain minimum 2 letters"),
    displayImages: z.string().array(),
    logo: z.string().nullish(),
  })
  .strict();

const clinicController = {
  async createClinic(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const resp = await clinicSchema.parseAsync(req.body);
      const admins = [];
      admins.push(req.user?.id as string);
      const data = {
        ...resp,
        adminId: admins,
      };
      await prisma.clinic.create({ data });
      res.json(customResponse(201, "Clinic created successfully 👌"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },

  async editClinic(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {

    try {
      const resp=await clinicSchema.parseAsync(req.body);
      const clinicId = req.params.id;
      const userId = req.user?.id as string;
      const clinic = await prisma.clinic.findUniqueOrThrow({
        where: {
          id: clinicId,
        },
      });
      if (clinic.adminId.includes(userId)) {
        const data = {
          ...resp,
        };
        await prisma.clinic.update({
          where: {
            id: clinic.id,
          },
          data,
        });
        res.json(customResponse(200, "Successfully updated the clinic ✅"));
      } else if (!clinic.adminId.includes(userId)) {  
        throw new Error();
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getClinic(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.id as string;
      const clinics = await prisma.clinic.findMany({
        where: {
          adminId: {
            equals: adminId,
          },
        },
      });
      res.json(customResponse(200, clinics));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async deleteClinic(req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinicId = req.params.id;
      const userId = req.user?.id as string;
      const clinic = await prisma.clinic.findUniqueOrThrow({
        where: {
          id: clinicId,
        },
      });
      if (clinic.adminId.includes(userId)) {
        await prisma.clinic.delete({
          where: {
            id: clinic.id,
          },
        });
        res.json(customResponse(200, "Successfully deleted the clinic ✅"));
      } else if (!clinic.adminId.includes(userId)) {
        throw new Error();
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default clinicController;
