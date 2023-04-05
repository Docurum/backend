import prisma from "@src/prisma";
import { emailSchema } from "@src/v1/schemas";
import { customResponse } from "@src/v1/utils/Response.util";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { z } from "zod";
const doctorSchema = z.object({
  medicalCouncil: z.string(),
  registrationNumber: z.string(),
  hospital: z.string(),
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
}).strict();
const clinicSchema = z
  .object({
    name: z
      .string()
      .min(4, "Name must contain at least 4 characters")
      .max(150, "Name must contain at most 150 characters")
      .trim(),
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
  async createClinic(
    req: Request<{}, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async isAppliedDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
   try{
    const userId = req.user?.id as string;
    const doctor = await prisma.doctor.findFirst({
      where: {
        userId,
      }
    })
if(doctor){
  res.json(customResponse(200,{applied:true}));
}
else{
  res.json(customResponse(200,{applied:false}));
}
   }catch(err){
    console.log(err);
    return next({
      status: createError.InternalServerError().status,
      message: err,
    });
   }
  },
  async getCredencials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try{
const userId = req.user?.id as string;
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    });
    if (user.isAdmin) {
      const doctors = await prisma.doctor.findMany({
        where: {
          isVerified: false,
        },
      });
      res.json(customResponse(200, doctors));
    }
    }catch(err){
      console.log(err);
       return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async verifyDoctor(
    req: Request<{ id: string }, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const resp = await doctorSchema.parseAsync(req.body);
      const userId = req.user?.id as string;
      const data = {
        ...resp,

        userId: userId,
      };
      await prisma.doctor.create({ data });
      res.json(
        customResponse(
          201,
          "you have successfully send you credentials please wait till it gets approved👌"
        )
      );
    } catch (err) {
      console.log(err);
      console.log(err);
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async editClinic(
    req: Request<{ id: string }, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const resp = await clinicSchema.parseAsync(req.body);
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
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async getClinic(
    req: Request<{}, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async deleteClinic(
    req: Request<{ id: string }, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async getClinicById(
    req: Request<{ id: string }, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clinicId = req.params.id;
      const clinic = await prisma.clinic.findUnique({
        where: {
          id: clinicId,
        },
      });
      res.json(customResponse(200, clinic));
    } catch (err) {
      console.log(err);
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
  async getClinicByUsername(
    req: Request<{ username: string }, {}, any>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          username,
        },
      });
      const clinics = await prisma.clinic.findMany({
        where: {
          adminId: {
            equals: user.id,
          },
        },
        take: 10,
      });
      res.json(customResponse(200, clinics));
    } catch (err) {
      console.log(err);
      return next({
        status: createError.InternalServerError().status,
        message: err,
      });
    }
  },
};

export default clinicController;
