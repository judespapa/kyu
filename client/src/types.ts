export type AlbumMood = "sunlit" | "golden" | "sea" | "night";
export type AlbumLayout = "mosaic" | "film" | "stack";

export type Photo = {
  id: string;
  url: string;
  caption: string;
  contributor: string;
  createdAt: string;
};

export type Album = {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  mood: AlbumMood | string;
  layout: AlbumLayout | string;
  createdAt: string;
  photos: Photo[];
};

export type AlbumSummary = {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  mood: string;
  createdAt: string;
  photoCount: number;
  coverUrl: string | null;
};

export type ShareInfo = {
  port: number;
  local: string;
  lan: string[];
};
