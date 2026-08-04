import { env } from "../config/env.config.js";

const PRODUCT_HUNT_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql";
const SUCCESS_CACHE_TTL_MS = 5 * 60 * 1000;
const ERROR_CACHE_TTL_MS = 60 * 1000;

export interface ProductHuntStats {
  configured: boolean;
  fetchedAt: string | null;
  postUrl: string;
  votesCount: number | null;
}

interface ProductHuntGraphqlResponse {
  data?: {
    post?: {
      url?: string;
      votesCount?: number;
    } | null;
  };
  errors?: Array<{ message?: string }>;
}

interface CachedStats {
  expiresAt: number;
  value: ProductHuntStats;
}

export class ProductHuntService {
  private cache?: CachedStats;

  async getStats(): Promise<ProductHuntStats> {
    const configured =
      env.TRACELLM_PRODUCT_HUNT_ENABLED &&
      env.TRACELLM_PRODUCT_HUNT_TOKEN.length > 0 &&
      env.TRACELLM_PRODUCT_HUNT_POST_SLUG.length > 0;

    if (!configured) {
      return {
        configured: false,
        fetchedAt: null,
        postUrl: env.TRACELLM_PRODUCT_HUNT_URL,
        votesCount: null
      };
    }

    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.value;
    }

    try {
      const response = await fetch(PRODUCT_HUNT_GRAPHQL_URL, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${env.TRACELLM_PRODUCT_HUNT_TOKEN}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          query: `
            query TraceLLMProductHuntPost($slug: String!) {
              post(slug: $slug) {
                url
                votesCount
              }
            }
          `,
          variables: {
            slug: env.TRACELLM_PRODUCT_HUNT_POST_SLUG
          }
        })
      });

      const payload = (await response.json().catch(() => undefined)) as ProductHuntGraphqlResponse | undefined;

      if (!response.ok || payload?.errors?.length) {
        throw new Error("Product Hunt request failed");
      }

      const post = payload?.data?.post;
      if (!post || typeof post.votesCount !== "number") {
        throw new Error("Product Hunt post was not found");
      }

      return this.remember(
        {
          configured: true,
          fetchedAt: new Date().toISOString(),
          postUrl: post.url ?? env.TRACELLM_PRODUCT_HUNT_URL,
          votesCount: post.votesCount
        },
        SUCCESS_CACHE_TTL_MS
      );
    } catch {
      return this.remember(
        {
          configured: true,
          fetchedAt: null,
          postUrl: env.TRACELLM_PRODUCT_HUNT_URL,
          votesCount: null
        },
        ERROR_CACHE_TTL_MS
      );
    }
  }

  private remember(value: ProductHuntStats, ttlMs: number): ProductHuntStats {
    this.cache = {
      expiresAt: Date.now() + ttlMs,
      value
    };

    return value;
  }
}
