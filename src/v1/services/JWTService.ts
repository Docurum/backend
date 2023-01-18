/* eslint-disable @typescript-eslint/no-extraneous-class */
import jwt, { JwtPayload } from "jsonwebtoken";

const JWTOptions = {
  issuer: "docurum.com",
};

// https://github.com/pinakipb2/cuidly/blob/main/backend/auth/src/v1/services/JwtService.js
class JWTService {
  static sign(type: "ACCESS_TOKEN" | "REFRESH_TOKEN" | "DEFAULT", payload: JwtPayload, userId: string, expiry: string | number | undefined = "1d"): string {
    console.log(type);
    const secret = userId;
    return jwt.sign(payload, secret, { ...JWTOptions, expiresIn: expiry, audience: userId });
  }
}

export default JWTService;
