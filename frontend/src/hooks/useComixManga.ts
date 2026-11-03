import { useQuery } from "@tanstack/react-query";
import { getComixChapters, getComixChapterImages, getComixHome, getComixManga } from "@/services/comix";

export function useComixHome() {
  return useQuery({ queryKey: ["comix", "home"], queryFn: getComixHome, staleTime: 1000 * 60 * 10 });
}

export function useComixManga(id: string | undefined) {
  return useQuery({
    queryKey: ["comix", "manga", id],
    queryFn: () => getComixManga(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
  });
}

export function useComixChapters(id: string | undefined) {
  return useQuery({
    queryKey: ["comix", "chapters", id],
    queryFn: () => getComixChapters(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}

export function useComixChapterImages(chapterId: string | undefined) {
  return useQuery({
    queryKey: ["comix", "chapter", chapterId],
    queryFn: () => getComixChapterImages(chapterId as string),
    enabled: Boolean(chapterId),
    staleTime: 1000 * 60 * 30,
  });
}
