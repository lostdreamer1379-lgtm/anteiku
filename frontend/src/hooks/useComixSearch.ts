import { useQuery } from "@tanstack/react-query";
import { searchComixManga } from "@/services/comix";

export function useComixSearch(title: string) {
  return useQuery({
    queryKey: ["comix", "search", title],
    queryFn: () => searchComixManga(title),
    enabled: Boolean(title),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
