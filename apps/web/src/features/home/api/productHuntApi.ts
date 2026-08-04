import { apiGet } from "../../../shared/api/client.js";

export interface ProductHuntStats {
  configured: boolean;
  fetchedAt: string | null;
  postUrl: string;
  votesCount: number | null;
}

export function getProductHuntStats(): Promise<ProductHuntStats> {
  return apiGet<ProductHuntStats>("/v1/public/product-hunt");
}
