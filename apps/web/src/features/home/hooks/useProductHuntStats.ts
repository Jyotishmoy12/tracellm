import { useQuery } from "@tanstack/react-query";
import { getProductHuntStats } from "../api/productHuntApi.js";

export function useProductHuntStats() {
  return useQuery({
    queryKey: ["product-hunt-stats"],
    queryFn: getProductHuntStats,
    refetchInterval: 2 * 60 * 1000,
    retry: false,
    staleTime: 60 * 1000
  });
}
