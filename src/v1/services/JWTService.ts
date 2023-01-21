/* eslint-disable @typescript-eslint/no-extraneous-class */
import jwt, { JwtPayload } from "jsonwebtoken";

const JWTOptions = {
  algorithm: "HS256" as jwt.Algorithm,
  issuer: "docurum.com",
};

// https://github.com/pinakipb2/cuidly/blob/main/backend/auth/src/v1/services/JwtService.js
class JWTService {
  static sign(payload: JwtPayload, userId: string, expiry: string | number | undefined = "1d", secret: string): string {
    const secretKey = secret + userId;
    return jwt.sign(payload, secretKey, { ...JWTOptions, expiresIn: expiry, audience: userId });
  }

  static verify(token: string, secret: string): string | JwtPayload {
    return jwt.verify(token, secret, JWTOptions);
  }

  static decode(token: string): string | JwtPayload | null {
    return jwt.decode(token);
  }
}

export default JWTService;
