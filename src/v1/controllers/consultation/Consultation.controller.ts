import { google } from "googleapis";
import { NextFunction, Request, Response } from "express";
import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import createError from "http-errors";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import config from "@src/v1/config";
import Razorpay from "razorpay";
import hmacSHA256 from "crypto-js/hmac-sha256";
import { Configuration, OpenAIApi } from "openai";

const openAi = new OpenAIApi(
  new Configuration({
    apiKey: config.OPEN_AI_API_KEY,
  })
);

const consultationController = {
  async createPaymentOrder(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const pricingId = req.body.pricingId;
      const pricing = await prisma.pricing.findUniqueOrThrow({
        where: {
          id: pricingId,
        },
      });

      const instance = new Razorpay({
        key_id: config.RAZORPAY_KEY,
        key_secret: config.RAZORPAY_SECRET,
      });

      const options = {
        amount: pricing.costPerSession * pricing.numberOfSessions * 100, // amount in smallest currency unit
        currency: "INR",
        receipt: uuidv4(),
        notes: {
          pricing: pricing.id,
          host: pricing.userId,
          attendee: userId,
        },
      };

      const order = await instance.orders.create(options);
      res.json(customResponse(201, order));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async paymentSuccess(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      const generatedSignature = hmacSHA256(orderCreationId + "|" + razorpayPaymentId, config.RAZORPAY_SECRET);
      if (generatedSignature !== razorpaySignature) {
        res.json(customResponse(400, "Transaction is not legit"));
      }
      const userId = req.user?.id as string;
      const pricingId = req.body.pricingId;
      const pricing = await prisma.pricing.findUniqueOrThrow({
        where: {
          id: pricingId,
        },
      });

      const consultationCount = pricing.numberOfSessions;
      const consultationList = [];
      for (let i = 0; i < consultationCount; i++) {
        const ob = {
          title: pricing.title,
          hostId: pricing.userId,
          attendeeId: userId,
          durationInMinutes: pricing.durationInMinutes,
        };
        consultationList.push(ob);
      }
      await prisma.consultation.createMany({
        data: consultationList,
      });
      res.json(
        customResponse(200, {
          message: "success",
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        })
      );
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async scheduleEvent(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const googleCalender = google.calendar({
        version: "v3",
        auth: config.GOOGLE_API_KEY,
      });
      const oauth2Client = new google.auth.OAuth2(config.GOOGLE_OAUTH_CLIENT_ID, config.GOOGLE_OAUTH_CLIENT_SECRET, config.GOOGLE_OAUTH_CLIENT_REDIRECT_URL);
      const token = req.body.token;
      oauth2Client.setCredentials(token);

      await googleCalender.events.insert({
        calendarId: "primary",
        auth: oauth2Client,
        conferenceDataVersion: 1,
        requestBody: {
          summary: "This is a test event",
          description: "Dr. Pal Event",
          start: {
            dateTime: dayjs(new Date()).add(1, "day").toISOString(),
            timeZone: "Asia/Kolkata",
          },
          end: {
            dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
            timeZone: "Asia/Kolkata",
          },
          conferenceData: {
            createRequest: {
              requestId: uuidv4(),
            },
          },
          attendees: [
            {
              email: "arnab.bhattacharya28122000@gmail.com",
            },
            {
              email: "anita.bhattacharjee3@gmail.com",
            },
          ],
        },
      });
      res.json(customResponse(200, "Event Scheduled successfully"));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getAttendeePendingConsultations(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;

      const consultations = await prisma.consultation.findMany({
        where: {
          attendeeId: userId,
          isComplete: false,
        },
        take: 10,
        select: {
          id: true,
          title: true,
          isComplete: true,
          durationInMinutes: true,
          attachment: true,
          attendee: {
            select: {
              id: true,
              picture: true,
              name: true,
              username: true,
            },
          },
          host: {
            select: {
              id: true,
              picture: true,
              name: true,
              username: true,
            },
          },
        },
      });
      res.json(customResponse(200, consultations));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getAttendeeCompletedConsultations(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;

      const consultations = await prisma.consultation.findMany({
        where: {
          attendeeId: userId,
          isComplete: true,
        },
        take: 10,
        select: {
          id: true,
          title: true,
          isComplete: true,
          durationInMinutes: true,
          attachment: true,
          attendee: {
            select: {
              id: true,
              picture: true,
              name: true,
              username: true,
            },
          },
          host: {
            select: {
              id: true,
              picture: true,
              name: true,
              username: true,
            },
          },
        },
      });
      res.json(customResponse(200, consultations));
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
  async getAiChatCompletion(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = req.body.message;
      const userId = req.user?.id as string;
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      if (!user.isAdmin) {
        res.json(customResponse(200, "Only verified doctors and admins can generate messages"));
      }
      if (user.isAdmin) {
        const response = await openAi.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        });
        res.json(customResponse(200, response.data.choices[0].message?.content));
      }
    } catch (err) {
      console.log(err);
      return next({ status: createError.InternalServerError().status, message: err });
    }
  },
};

export default consultationController;
