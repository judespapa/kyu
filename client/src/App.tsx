import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  createAlbum,
  deletePhoto,
  getAlbum,
  getShareInfo,
  listAlbums,
  updateAlbum,
  updateCaption,
  uploadPhotos,
} from "./api";
import type { Album, AlbumLayout, AlbumMood, AlbumSummary, ShareInfo } from "./types";

const MOODS: { id: AlbumMood; label: string }[] = [
  { id: "sunlit", label: "Sunlit" },
  { id: "golden", label: "Golden hour" },
  { id: "sea", label: "Sea glass" },
  { id: "night", label: "Night swim" },
];

const LAYOUTS: { id: AlbumLayout; label: string }[] = [
  { id: "mosaic", label: "Mosaic" },
  { id: "film", label: "Film strip" },
  { id: "stack", label: "Tilted stack" },
];

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80";

function rememberAlbum(code: string) {
  const key = "kyu:recent";
  const existing = JSON.parse(localStorage.getItem(key) || "[]") as string[];
  const next = [code.toUpperCase(), ...existing.filter((item) => item !== code.toUpperCase())].slice(
    0,
    8,
  );
  localStorage.setItem(key, JSON.stringify(next));
}

function HomePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [mood, setMood] = useState<AlbumMood>("sunlit");
  const [layout, setLayout] = useState<AlbumLayout>("mosaic");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);

  useEffect(() => {
    listAlbums()
      .then(setAlbums)
      .catch(() => setAlbums([]));
    getShareInfo()
      .then(setShareInfo)
      .catch(() => setShareInfo(null));
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const album = await createAlbum({
        title: title.trim() || "Our vacation",
        creatorName: creatorName.trim() || "Family",
        mood,
        layout,
      });
      rememberAlbum(album.code);
      navigate(`/a/${album.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create album");
    } finally {
      setBusy(false);
    }
  }

  async function onJoin(event: FormEvent) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setError("");
    try {
      await getAlbum(code);
      rememberAlbum(code);
      navigate(`/a/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Album not found");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero__media" aria-hidden="true" />
        <div className="hero__content">
          <p className="brand">kyu</p>
          <h1 className="hero__headline">Albums you make together, while you’re still there.</h1>
          <p className="hero__support">
            Create a shared vacation reel with your family. Drop in photos, pass the invite code, keep
            the week glowing.
          </p>
          <div className="cta-row">
            <a className="btn btn--primary" href="#create">
              Create an album
            </a>
            <a className="btn btn--ghost" href="#join">
              Join with a code
            </a>
          </div>
        </div>
      </section>

      <section className="panel-section" id="create">
        <div className="section-heading">
          <h2>Start this trip’s album</h2>
          <p>One shared space for everyone on the same Wi‑Fi. No accounts — just a short invite code.</p>
        </div>

        <div className="action-grid">
          <form className="composer" onSubmit={onCreate}>
            <div className="field">
              <label htmlFor="title">Album name</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunset week in Lisbon"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="creator">Your name</label>
              <input
                id="creator"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Alex"
              />
            </div>
            <div className="field">
              <span>Mood</span>
              <div className="choice-row">
                {MOODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`choice ${mood === item.id ? "is-active" : ""}`}
                    onClick={() => setMood(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Layout</span>
              <div className="choice-row">
                {LAYOUTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`choice ${layout === item.id ? "is-active" : ""}`}
                    onClick={() => setLayout(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn btn--ink" type="submit" disabled={busy}>
              {busy ? "Opening…" : "Create album"}
            </button>
          </form>

          <div className="join-box" id="join">
            <div className="section-heading">
              <h2>Jump into theirs</h2>
              <p>Ask whoever started the album for the six-letter code.</p>
            </div>
            <form className="composer" onSubmit={onJoin}>
              <div className="field">
                <label htmlFor="code">Invite code</label>
                <input
                  id="code"
                  className="code-input"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="AB12CD"
                  maxLength={6}
                  required
                />
              </div>
              <button className="btn btn--sea" type="submit" disabled={busy}>
                Join album
              </button>
            </form>

            {albums.length > 0 && (
              <div className="recent-list">
                {albums.slice(0, 4).map((album) => (
                  <Link key={album.id} className="recent-link" to={`/a/${album.code}`}>
                    {album.coverUrl ? (
                      <img className="recent-thumb" src={album.coverUrl} alt="" />
                    ) : (
                      <div className="recent-thumb placeholder">k</div>
                    )}
                    <div className="recent-meta">
                      <strong>{album.title}</strong>
                      <span>
                        {album.photoCount} photo{album.photoCount === 1 ? "" : "s"} · {album.creatorName}
                      </span>
                    </div>
                    <span className="recent-code">{album.code}</span>
                  </Link>
                ))}
              </div>
            )}

            {shareInfo?.lan?.[0] && (
              <p className="share-note">
                On vacation Wi‑Fi, family can open <code>{shareInfo.lan[0]}</code> after you start kyu on
                this device.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function AlbumPage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCaption, setDraftCaption] = useState("");
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);

  useEffect(() => {
    const upper = code.toUpperCase();
    getAlbum(upper)
      .then((data) => {
        setAlbum(data);
        rememberAlbum(data.code);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Album missing"));
    getShareInfo()
      .then(setShareInfo)
      .catch(() => setShareInfo(null));

    const savedName = localStorage.getItem("kyu:name");
    if (savedName) setContributor(savedName);
  }, [code]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cover = useMemo(() => album?.photos[0]?.url || HERO_FALLBACK, [album]);

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    if (!album || !files?.length) return;
    setBusy(true);
    setError("");
    try {
      localStorage.setItem("kyu:name", contributor.trim() || "Someone");
      const result = await uploadPhotos(
        album.code,
        files,
        contributor.trim() || "Someone",
        caption.trim(),
      );
      setAlbum(result.album);
      setCaption("");
      setFiles(null);
      setShowUpload(false);
      setToast("Photos added to the album");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLayoutChange(layout: AlbumLayout) {
    if (!album) return;
    const next = await updateAlbum(album.code, { layout });
    setAlbum(next);
  }

  async function onMoodChange(mood: AlbumMood) {
    if (!album) return;
    const next = await updateAlbum(album.code, { mood });
    setAlbum(next);
  }

  async function copyInvite() {
    if (!album) return;
    const host = shareInfo?.lan?.[0] || shareInfo?.local || window.location.origin;
    const text = `Join our kyu album “${album.title}” — code ${album.code}. Open ${host} and enter the code.`;
    await navigator.clipboard.writeText(text);
    setToast("Invite copied");
  }

  async function saveCaption(photoId: string) {
    if (!album) return;
    const result = await updateCaption(album.code, photoId, draftCaption);
    setAlbum(result.album);
    setEditingId(null);
    setToast("Caption saved");
  }

  async function removePhoto(photoId: string) {
    if (!album) return;
    const result = await deletePhoto(album.code, photoId);
    setAlbum(result.album);
    setToast("Photo removed");
  }

  if (error && !album) {
    return (
      <div className="panel-section">
        <div className="error">{error}</div>
        <button className="btn btn--ink" style={{ marginTop: "1rem" }} onClick={() => navigate("/")}>
          Back home
        </button>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="panel-section">
        <p>Opening album…</p>
      </div>
    );
  }

  return (
    <div className={`app-shell album-page mood-${album.mood}`}>
      <div className="album-top">
        <Link className="brand-mark" to="/">
          kyu
        </Link>
        <button className="btn btn--quiet" type="button" onClick={copyInvite}>
          Share invite
        </button>
      </div>

      <header className="album-hero">
        <div
          className="album-hero__media"
          style={{ backgroundImage: `url(${cover})` }}
          aria-hidden="true"
        />
        <div className="album-hero__body">
          <h1>{album.title}</h1>
          <p>
            Started by {album.creatorName} · {album.photos.length} photo
            {album.photos.length === 1 ? "" : "s"}
          </p>
          <div className="invite-row">
            <span className="invite-code">{album.code}</span>
            <button className="btn btn--primary" type="button" onClick={() => setShowUpload((v) => !v)}>
              {showUpload ? "Close upload" : "Add photos"}
            </button>
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-group">
          <span>Layout</span>
          {LAYOUTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`choice ${album.layout === item.id ? "is-active" : ""}`}
              onClick={() => onLayoutChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="toolbar-group">
          <span>Mood</span>
          {MOODS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`choice ${album.mood === item.id ? "is-active" : ""}`}
              onClick={() => onMoodChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {showUpload && (
        <form className="upload-panel" onSubmit={onUpload}>
          <div className="fields">
            <div className="field">
              <label htmlFor="contributor">Your name</label>
              <input
                id="contributor"
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                placeholder="Jamie"
              />
            </div>
            <div className="field">
              <label htmlFor="caption">Caption for the first photo</label>
              <input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="The gelato that ended us"
              />
            </div>
            <div className="field">
              <label>Photos</label>
              <div className="btn btn--sea file-pill">
                {files?.length ? `${files.length} selected` : "Choose from camera roll"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn--ink" type="submit" disabled={busy || !files?.length}>
            {busy ? "Uploading…" : "Drop into album"}
          </button>
        </form>
      )}

      <section className="gallery">
        {album.photos.length === 0 ? (
          <div className="empty-gallery">
            <h2>This reel is waiting</h2>
            <p>Add the first photos from the beach, the dinner table, the ridiculous detour.</p>
          </div>
        ) : (
          <div className={album.layout}>
            {album.photos.map((photo, index) => (
              <article
                className="shot"
                key={photo.id}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <div className="shot__image-wrap">
                  <img src={photo.url} alt={photo.caption || `Photo by ${photo.contributor}`} />
                </div>
                <div className="shot__meta">
                  {editingId === photo.id ? (
                    <>
                      <input
                        className="caption-edit"
                        value={draftCaption}
                        onChange={(e) => setDraftCaption(e.target.value)}
                        placeholder="Write a caption"
                      />
                      <div className="shot__actions">
                        <button className="btn btn--sea" type="button" onClick={() => saveCaption(photo.id)}>
                          Save
                        </button>
                        <button className="btn btn--quiet" type="button" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{photo.caption || "Untitled moment"}</strong>
                      <span>
                        {photo.contributor} ·{" "}
                        {new Date(photo.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="shot__actions">
                        <button
                          className="btn btn--quiet"
                          type="button"
                          onClick={() => {
                            setEditingId(photo.id);
                            setDraftCaption(photo.caption);
                          }}
                        >
                          Caption
                        </button>
                        <button
                          className="btn btn--quiet"
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="share-note">
        Family on the same network can open{" "}
        <code>{shareInfo?.lan?.[0] || shareInfo?.local || window.location.origin}</code> and enter{" "}
        <code>{album.code}</code>.
      </p>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/a/:code" element={<AlbumPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
