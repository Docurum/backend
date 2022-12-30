import app from "../../app";
import supertest from "supertest";

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
    expect(resp.body).toStrictEqual({ ...userPayload, name: "Pinaki Bhattacharjee" });
  });
});
