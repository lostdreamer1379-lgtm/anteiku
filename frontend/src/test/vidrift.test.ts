import { describe, expect, it } from "vitest";
import { VIDRIFT_ORIGIN, vidriftAnilistUrl } from "@/components/player/providers/VidRiftProvider";

describe("VidRift AniList embed URL", () => {
  it("builds an Anteiku-branded subbed episode URL", () => {
    const url = new URL(vidriftAnilistUrl(16498, 1, { title: "Attack on Titan" }));

    expect(url.origin).toBe(VIDRIFT_ORIGIN);
    expect(url.pathname).toBe("/embed/anilist/16498/1");
    expect(url.searchParams.get("brand")).toBe("Anteiku");
    expect(url.searchParams.get("showTitle")).toBe("1");
    expect(url.searchParams.get("exit")).toBe("1");
    expect(url.searchParams.get("autoplay")).toBe("0");
    expect(url.searchParams.get("hide")).toBe("episodes,next");
    expect(url.searchParams.has("dub")).toBe(false);
  });

  it("adds the English-dub parameter when requested", () => {
    const url = new URL(vidriftAnilistUrl(16498, 2, { dub: true }));
    expect(url.searchParams.get("dub")).toBe("1");
  });

  it("rejects invalid AniList IDs and episode numbers", () => {
    expect(() => vidriftAnilistUrl(0, 1)).toThrow();
    expect(() => vidriftAnilistUrl(16498, 0)).toThrow();
  });
});
