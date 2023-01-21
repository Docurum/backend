/* eslint-disable no-template-curly-in-string */

import prisma from "@src/prisma";
import { z } from "zod";

export const envSchema = z
  .object({
    PORT: z
      .string()
      .min(1)
      .default("5000")
      .transform((port) => Number(port)),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    DEV_DB_URL: z.string().min(1),
    TEST_DB_URL: z.string().min(1),
    PROD_DB_URL: z.string().optional(),
    DATABASE_URL: z.string().default("${DEV_DB_URL}"),
    GMAIL_ACCOUNT: z.string().min(1),
    MAILGUN_API_KEY: z.string().min(1),
    MAILGUN_DOMAIN: z.string().min(1),
    EMAIL_CONFIRM_TOKEN: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  })
  .transform((env) => {
    if (env.NODE_ENV === "development") {
      env.DATABASE_URL = "${DEV_DB_URL}";
    } else if (env.NODE_ENV === "test") {
      env.DATABASE_URL = "${TEST_DB_URL}";
    } else {
      env.DATABASE_URL = "${PROD_DB_URL}";
    }
    return env;
  });

const capitalizeEveryFirstLetter = (s: string): string => {
  const arr = s.split(" ");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(" ");
};

const nameSchema = z
  .string()
  .min(3)
  .max(80)
  .trim()
  .transform((name) => {
    // Also removes additional spaces
    const transformedName = capitalizeEveryFirstLetter(name).replace(/\s+/g, " ");
    return transformedName;
  });

export const usernameSchema = z
  .string()
  .min(4)
  .max(20)
  // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
  .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm)
  .trim()
  .transform((username) => username.toLocaleLowerCase())
  .refine(
    async (username) => {
      try {
        await prisma.user.findUniqueOrThrow({
          where: {
            username,
          },
        });
        return false;
      } catch (err) {
        return true;
      }
    },
    {
      message: "Username already exists",
    }
  );

export const emailSchema = z
  .string()
  .min(4)
  .max(60)
  .email()
  .trim()
  .refine(
    async (email) => {
      try {
        await prisma.user.findUniqueOrThrow({
          where: {
            email,
          },
        });
        return false;
      } catch (err) {
        return true;
      }
    },
    {
      message: "Email already exists",
    }
  );

const passwordSchema = z
  .string()
  .min(8)
  .max(50)
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm, "Must contain at least one uppercase letter, one lowercase letter, one number and one special character")
  .trim();

export const registerSchema = z
  .object({
    name: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    picture: z.string().nullish(),
    isDoctor: z.boolean().default(false),
  })
  .strict()
  .refine(
    ({ confirmPassword, password }) => {
      return confirmPassword === password;
    },
    {
      path: ["confirmPassword"],
      message: "Passwords don't match",
    }
  );
