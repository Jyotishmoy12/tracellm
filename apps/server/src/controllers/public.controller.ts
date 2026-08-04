import type { Request, Response } from "express";
import type { ProductHuntService } from "../services/product-hunt.service.js";

export class PublicController {
  constructor(private readonly productHuntService: ProductHuntService) {}

  async getProductHuntStats(_request: Request, response: Response): Promise<void> {
    response.json(await this.productHuntService.getStats());
  }
}
