import type { Album, AlbumLayout, AlbumMood, AlbumSummary, ShareInfo } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data as T;
}

export function listAlbums() {
  return request<AlbumSummary[]>("/api/albums");
}

export function getAlbum(code: string) {
  return request<Album>(`/api/albums/${code}`);
}

export function createAlbum(input: {
  title: string;
  creatorName: string;
  mood: AlbumMood;
  layout: AlbumLayout;
}) {
  return request<Album>("/api/albums", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateAlbum(
  code: string,
  input: Partial<{ title: string; mood: AlbumMood; layout: AlbumLayout }>,
) {
  return request<Album>(`/api/albums/${code}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function uploadPhotos(
  code: string,
  files: FileList | File[],
  contributor: string,
  caption: string,
) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append("photos", file));
  form.append("contributor", contributor);
  form.append("caption", caption);
  return request<{ album: Album }>(`/api/albums/${code}/photos`, {
    method: "POST",
    body: form,
  });
}

export function updateCaption(code: string, photoId: string, caption: string) {
  return request<{ album: Album }>(`/api/albums/${code}/photos/${photoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });
}

export function deletePhoto(code: string, photoId: string) {
  return request<{ album: Album }>(`/api/albums/${code}/photos/${photoId}`, {
    method: "DELETE",
  });
}

export function getShareInfo() {
  return request<ShareInfo>("/api/share-info");
}
