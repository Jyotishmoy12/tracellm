import { generateKeyPair, jwtVerify, SignJWT, type JWTPayload } from "jose";
import { env } from "../config/env.config.js";

interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
}

let keyPairPromise: ReturnType<typeof generateKeyPair> | undefined;

export class JwtService {
  async signSession(payload: { userId: string; email: string }): Promise<string> {
    const { privateKey } = await getKeyPair();
    return new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(env.TRACELLM_JWT_ISSUER)
      .setAudience(env.TRACELLM_JWT_AUDIENCE)
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime(`${env.TRACELLM_JWT_TTL_SECONDS}s`)
      .sign(privateKey);
  }

  async verifySession(token: string): Promise<{ userId: string; email: string }> {
    const { publicKey } = await getKeyPair();
    const { payload } = await jwtVerify<SessionClaims>(token, publicKey, {
      issuer: env.TRACELLM_JWT_ISSUER,
      audience: env.TRACELLM_JWT_AUDIENCE
    });

    if (!payload.sub || !payload.email) {
      throw new Error("Invalid session token");
    }

    return {
      userId: payload.sub,
      email: payload.email
    };
  }
}

function getKeyPair() {
  keyPairPromise ??= generateKeyPair("RS256", { extractable: false });
  return keyPairPromise;
}
