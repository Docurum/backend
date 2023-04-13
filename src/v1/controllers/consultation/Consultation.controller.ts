import { google } from "googleapis";
import { NextFunction, Request, Response } from "express";
import prisma from "@src/prisma";
import { customResponse } from "@src/v1/utils/Response.util";
import createError from "http-errors";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import config from "@src/v1/config";

const consultationController = {
  async createConsultation(req: Request<{}, {}, any>, res: Response, next: NextFunction): Promise<void> {
    try {
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
      res.json(customResponse(201, "Consultation created successfully"));
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
};

export default consultationController;
