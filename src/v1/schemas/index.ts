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
    FRONTEND_URL: z.string().default("https://www.docurum.com"),
    DEV_DB_URL: z.string().min(1),
    TEST_DB_URL: z.string().min(1),
    PROD_DB_URL: z.string().optional(),
    DATABASE_URL: z.string().default("${DEV_DB_URL}"),
    GMAIL_ACCOUNT: z.string().min(1),
    MAILGUN_API_KEY: z.string().min(1),
    MAILGUN_DOMAIN: z.string().min(1),
    EMAIL_CONFIRM_SECRET: z.string().min(1),
    PASSWORD_RESET_EMAIL_SECRET: z.string().min(1),
    PASSWORD_SALT_ROUNDS: z.number().default(10),
    USER_ACCESS_SECRET: z.string().min(1),
    USER_REFRESH_SECRET: z.string().min(1),
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
  .min(3, "Name must contain at least 3 characters")
  .max(80, "Name must contain at most 80 characters")
  .trim()
  .transform((name) => {
    // Also removes additional spaces
    const transformedName = capitalizeEveryFirstLetter(name).replace(/\s+/g, " ");
    return transformedName;
  });

export const usernameSchema = z
  .string()
  .min(4, "Username must contain at least 4 characters")
  .max(20, "Username must contain at most 20 characters")
  // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
  .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm, "Only A-Z, a-z, . and _ is allowed in Username")
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

export const categoryNameSchema = z
  .string()
  .min(4, "Category must contain at least 3 characters")
  .max(20, "Username must contain at most 30 characters")
  // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
  .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm, "Only A-Z, a-z, . and _ is allowed in Username")
  .trim()
  .transform((name) => name.toLocaleLowerCase())
  .refine(
    async (name) => {
      try {
        await prisma.category.findUniqueOrThrow({
          where: {
            name,
          },
        });
        return false;
      } catch (err) {
        return true;
      }
    },
    {
      message: "Category already exists",
    }
  );

export const emailSchema = z
  .string()
  .min(4, "Email must contain at least 4 characters")
  .max(60, "Email must contain at most 60 characters")
  .email("Please enter a valid email")
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

export const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(50, "Password must contain at most 50 characters")
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.")
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
