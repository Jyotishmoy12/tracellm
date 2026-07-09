import type { Request, Response } from "express";
import type { AuthService } from "../services/auth.service.js";
import { clearSessionCookie, setSessionCookie } from "../utils/cookies.js";

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  async register(request: Request, response: Response) {
    const result = await this.auth.register(request.body);
    setSessionCookie(response, result.token);
    response.status(201).json({ user: result.user });
  }

  async login(request: Request, response: Response) {
    const result = await this.auth.login(request.body);
    setSessionCookie(response, result.token);
    response.json({ user: result.user });
  }

  async me(request: Request, response: Response) {
    response.json(await this.auth.me(request.auth!.userId));
  }

  logout(_request: Request, response: Response) {
    clearSessionCookie(response);
    response.json({ loggedOut: true });
  }
}
