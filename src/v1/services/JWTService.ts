/* eslint-disable @typescript-eslint/no-extraneous-class */
import jwt, { JwtPayload } from "jsonwebtoken";

const JWTOptions = {
  algorithm: "HS256" as jwt.Algorithm,
  issuer: "docurum.com",
};

class JWTService {
  static sign(payload: JwtPayload, userId: string, expiry: string | number, secret: string): string {
    const secretKey = secret + userId;
    return jwt.sign(payload, secretKey, { ...JWTOptions, expiresIn: expiry, audience: userId });
  }

  static verify(token: string, userId: string, secret: string): string | JwtPayload {
    const secretKey = secret + userId;
    return jwt.verify(token, secretKey, JWTOptions);
  }

  static decode(token: string): string | JwtPayload | null {
    const decodedJWT = jwt.decode(token, { complete: true });
    if (decodedJWT?.header.alg !== JWTOptions.algorithm && decodedJWT?.header.typ !== "JWT") {
      throw new jwt.JsonWebTokenError("Headers don't match");
    }
    if ((decodedJWT.payload as jwt.JwtPayload).iss !== JWTOptions.issuer) {
      throw new jwt.JsonWebTokenError("Issuer don't match");
    }
    if ((decodedJWT.payload as jwt.JwtPayload).id !== (decodedJWT.payload as jwt.JwtPayload).aud) {
      throw new jwt.JsonWebTokenError("Audience don't match");
    }
    return decodedJWT.payload;
  }
}

export default JWTService;
