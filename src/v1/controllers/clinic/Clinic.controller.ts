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
      const topic = await prisma.clinic.create({ data });
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

export default clinicController;
