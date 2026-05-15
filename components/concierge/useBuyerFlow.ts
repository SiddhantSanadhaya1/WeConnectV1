import { useCallback, useState } from "react";
import { parseJsonSafe } from "./utils";
import { BuyerFlowRow } from "./types";

export function useBuyerFlow(buyerQuery: string, setAssistant: (v: string) => void) {
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerRows, setBuyerRows] = useState<BuyerFlowRow[]>([]);
  const [buyerRecommendations, setBuyerRecommendations] = useState<BuyerFlowRow[]>([]);
  const [buyerSelectedId, setBuyerSelectedId] = useState<string | null>(null);

  const runBuyerSearch = useCallback(async () => {
    setBuyerLoading(true);
    try {
      const qs = new URLSearchParams();
      if (buyerQuery.trim()) qs.set("query", buyerQuery.trim());
      const r = await fetch(`/api/buyer/search?${qs.toString()}`);
      const parsed = await parseJsonSafe<{
        results?: BuyerFlowRow[];
        recommendations?: BuyerFlowRow[];
      }>(r);
      if (!parsed.ok || !parsed.data) {
        setAssistant(parsed.errorMessage ?? "Buyer search failed.");
        return;
      }
      const results = parsed.data.results ?? [];
      setBuyerRows(results);
      setBuyerRecommendations(parsed.data.recommendations ?? []);
      if (results.length) {
        setBuyerSelectedId((prev) => prev ?? results[0].supplier.id);
      }
    } finally {
      setBuyerLoading(false);
    }
  }, [buyerQuery, setAssistant]);

  return {
    buyerLoading,
    buyerRows,
    buyerRecommendations,
    buyerSelectedId, setBuyerSelectedId,
    runBuyerSearch
  };
}
