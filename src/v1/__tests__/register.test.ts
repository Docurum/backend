import app from "@src/app";
import prisma from "@src/prisma";
import { successResp } from "@v1/utils/Response.util";
import "jest-extended";
import supertest from "supertest";

// Clear all Tables
beforeAll(async () => {
  const models = Object.keys(prisma).filter((key) => key[0] !== "_");
  const index = models.indexOf("$extends");
  models.splice(index, 1);
  const promises = models.map((name) => {
    // @ts-expect-error
    return prisma[name].deleteMany();
  });
  await Promise.all(promises);
});

describe("register user", () => {
  it("should throw error for no payload", async () => {
    const resp = await supertest(app).post("/v1/auth/register");
    expect(resp.body.status).toBe(500);
    const error = JSON.stringify(resp.body, null, 2);
    expect(error).toMatchSnapshot();
  });
  it("should throw error for invalid payload", async () => {
    const userPayload = {
      name: "   abc   def   ",
      email: "abc",
      username: "_s4_.sf",
      password: "123",
      confirmPassword: "123",
      isDoctor: false,
      abc: "def",
    };
    const resp = await supertest(app).post("/v1/auth/register").send(userPayload);
    expect(resp.body.status).toBe(500);
    const error = JSON.stringify(resp.body, null, 2);
    expect(error).toMatchSnapshot();
  });
  it("should pass for correct payload", async () => {
    const userPayload = {
      name: "pinaki bhattacharjee",
      email: "pinakipb2@gmail.com",
      username: "pinakipb2",
      password: "Abcdef@$12345",
      confirmPassword: "Abcdef@$12345",
      isDoctor: false,
    };
    const resp = await supertest(app).post("/v1/auth/register").send(userPayload);
    expect(resp.status).toBe(201);
    expect(resp.body).toStrictEqual(successResp(201, "User Registered Successfully"));
  });
  it("should throw error for duplicate payload", async () => {
    const userPayload = {
      name: "pinaki bhattacharjee",
      email: "pinakipb2@gmail.com",
      username: "pinakipb2",
      password: "Abcdef@$12345",
      confirmPassword: "Abcdef@$12345",
      isDoctor: false,
    };
    const resp = await supertest(app).post("/v1/auth/register").send(userPayload);
    expect(resp.status).toBe(500);
    expect(resp.body.message[0].path[0]).toBeOneOf(["username", "email"]);
    expect(resp.body.message[1].path[0]).toBeOneOf(["username", "email"]);
    expect(resp.body.message[0].message).toBeOneOf(["Email already exists", "Username already exists"]);
    expect(resp.body.message[1].message).toBeOneOf(["Email already exists", "Username already exists"]);
  });
});
