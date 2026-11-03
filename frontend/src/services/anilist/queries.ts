// Fragment kept small on purpose — extend per-query as real pages need more fields.
export const MEDIA_SUMMARY_FRAGMENT = /* GraphQL */ `
  fragment MediaSummary on Media {
    id
    title { romaji english native }
    coverImage { large }
    bannerImage
    averageScore
    format
    seasonYear
    genres
  }
`;

export const TRENDING_ANIME_QUERY = /* GraphQL */ `
  ${MEDIA_SUMMARY_FRAGMENT}
  query TrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        ...MediaSummary
      }
    }
  }
`;

export const SEARCH_ANIME_QUERY = /* GraphQL */ `
  ${MEDIA_SUMMARY_FRAGMENT}
  query SearchAnime(
    $search: String
    $genre: [String]
    $season: MediaSeason
    $seasonYear: Int
    $format: MediaFormat
    $status: MediaStatus
    $sort: [MediaSort]
    $page: Int
    $perPage: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(
        type: ANIME
        search: $search
        genre_in: $genre
        season: $season
        seasonYear: $seasonYear
        format: $format
        status: $status
        sort: $sort
        isAdult: false
      ) {
        ...MediaSummary
      }
    }
  }
`;

export const SEASONAL_ANIME_QUERY = /* GraphQL */ `
  ${MEDIA_SUMMARY_FRAGMENT}
  query SeasonalAnime($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        ...MediaSummary
        nextAiringEpisode { episode airingAt timeUntilAiring }
      }
    }
  }
`;

export const ANIME_DETAILS_QUERY = /* GraphQL */ `
  ${MEDIA_SUMMARY_FRAGMENT}
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      ...MediaSummary
      description(asHtml: false)
      episodes
      status
      popularity
      studios(isMain: true) { nodes { name } }
      relations { edges { node { ...MediaSummary } } }
      recommendations(perPage: 8) {
        nodes { mediaRecommendation { ...MediaSummary } }
      }
    }
  }
`;
