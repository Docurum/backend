import { z } from "zod";

const capitalizeEveryFirstLetter = (s: string): string => {
  const arr = s.split(" ");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  return arr.join(" ");
};

const nameSchema = z
  .string()
  .trim()
  .transform((name) => {
    // Also removes additional spaces
    const transformedName = capitalizeEveryFirstLetter(name).replace(/\s+/g, " ");
    return transformedName;
  });

// TODO: Add zod refinements https://github.com/colinhacks/zod#asynchronous-refinements

const usernameSchema = z
  .string()
  .min(8)
  .max(20)
  // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
  .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gm)
  .trim()
  .transform((username) => username.toLocaleLowerCase());

const emailSchema = z.string().email().trim();

const passwordSchema = z
  .string()
  .min(8)
  .max(50)
  // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm,
    "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character."
  )
  .trim();

export const registerSchema = z
  .object({
    name: nameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
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
