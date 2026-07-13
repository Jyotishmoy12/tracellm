import type { Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";

export class ChatController {
  constructor(private readonly chat = new ChatService()) {}

  config(_request: Request, response: Response) {
    response.json(this.chat.getConfig());
  }

  async complete(request: Request, response: Response) {
    const result = await this.chat.complete(request.body);
    response.json(result);
  }
}
