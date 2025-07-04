// src/hooks/useInsights.ts
import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "@/services/api";
import type { Insight } from "@/types/insight";

export const useMemberInsights = () =>
  useQuery<Insight[]>({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });
