import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const uploadsDir = path.join(dataDir, "uploads");
const storePath = path.join(dataDir, "albums.json");

fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(storePath)) {
  fs.writeFileSync(storePath, JSON.stringify({ albums: [] }, null, 2));
}

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

function readStore() {
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function getLanAddresses() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const entries of Object.values(nets)) {
    for (const net of entries || []) {
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

function publicAlbum(album) {
  return {
    id: album.id,
    code: album.code,
    title: album.title,
    creatorName: album.creatorName,
    mood: album.mood,
    createdAt: album.createdAt,
    layout: album.layout,
    photos: album.photos,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "kyu" });
});

app.get("/api/share-info", (_req, res) => {
  const lan = getLanAddresses();
  res.json({
    port: PORT,
    local: `http://localhost:${PORT}`,
    lan: lan.map((ip) => `http://${ip}:${PORT}`),
  });
});

app.get("/api/albums", (_req, res) => {
  const store = readStore();
  res.json(
    store.albums
      .map((album) => ({
        id: album.id,
        code: album.code,
        title: album.title,
        creatorName: album.creatorName,
        mood: album.mood,
        createdAt: album.createdAt,
        photoCount: album.photos.length,
        coverUrl: album.photos[0]?.url || null,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
});

app.post("/api/albums", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const creatorName = String(req.body?.creatorName || "").trim() || "Family";
  const mood = String(req.body?.mood || "sunlit").trim();
  const layout = String(req.body?.layout || "mosaic").trim();

  if (!title) {
    res.status(400).json({ error: "Album title is required" });
    return;
  }

  const store = readStore();
  let code = makeCode();
  while (store.albums.some((album) => album.code === code)) {
    code = makeCode();
  }

  const album = {
    id: randomUUID(),
    code,
    title,
    creatorName,
    mood,
    layout,
    createdAt: new Date().toISOString(),
    photos: [],
  };

  store.albums.push(album);
  writeStore(store);
  res.status(201).json(publicAlbum(album));
});

app.get("/api/albums/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const store = readStore();
  const album = store.albums.find((item) => item.code === code);
  if (!album) {
    res.status(404).json({ error: "Album not found. Check the invite code." });
    return;
  }
  res.json(publicAlbum(album));
});

app.patch("/api/albums/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const store = readStore();
  const album = store.albums.find((item) => item.code === code);
  if (!album) {
    res.status(404).json({ error: "Album not found" });
    return;
  }

  if (typeof req.body?.title === "string" && req.body.title.trim()) {
    album.title = req.body.title.trim();
  }
  if (typeof req.body?.layout === "string" && req.body.layout.trim()) {
    album.layout = req.body.layout.trim();
  }
  if (typeof req.body?.mood === "string" && req.body.mood.trim()) {
    album.mood = req.body.mood.trim();
  }

  writeStore(store);
  res.json(publicAlbum(album));
});

app.post("/api/albums/:code/photos", (req, res) => {
  upload.array("photos", 12)(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || "Upload failed" });
      return;
    }

    const code = String(req.params.code || "").toUpperCase();
    const store = readStore();
    const album = store.albums.find((item) => item.code === code);
    if (!album) {
      res.status(404).json({ error: "Album not found" });
      return;
    }

    const contributor = String(req.body?.contributor || "").trim() || "Someone";
    const caption = String(req.body?.caption || "").trim();
    const files = req.files || [];

    if (!files.length) {
      res.status(400).json({ error: "Add at least one photo" });
      return;
    }

    const created = files.map((file, index) => ({
      id: randomUUID(),
      url: `/uploads/${file.filename}`,
      caption: index === 0 ? caption : "",
      contributor,
      createdAt: new Date().toISOString(),
    }));

    album.photos.push(...created);
    writeStore(store);
    res.status(201).json({ photos: created, album: publicAlbum(album) });
  });
});

app.patch("/api/albums/:code/photos/:photoId", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const photoId = req.params.photoId;
  const store = readStore();
  const album = store.albums.find((item) => item.code === code);
  if (!album) {
    res.status(404).json({ error: "Album not found" });
    return;
  }

  const photo = album.photos.find((item) => item.id === photoId);
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  if (typeof req.body?.caption === "string") {
    photo.caption = req.body.caption.trim();
  }

  writeStore(store);
  res.json({ photo, album: publicAlbum(album) });
});

app.delete("/api/albums/:code/photos/:photoId", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const photoId = req.params.photoId;
  const store = readStore();
  const album = store.albums.find((item) => item.code === code);
  if (!album) {
    res.status(404).json({ error: "Album not found" });
    return;
  }

  const photo = album.photos.find((item) => item.id === photoId);
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  album.photos = album.photos.filter((item) => item.id !== photoId);
  const filename = path.basename(photo.url);
  const filepath = path.join(uploadsDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  writeStore(store);
  res.json({ album: publicAlbum(album) });
});

const clientDist = path.join(root, "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  const lan = getLanAddresses();
  console.log(`kyu listening on http://localhost:${PORT}`);
  for (const ip of lan) {
    console.log(`family Wi-Fi: http://${ip}:${PORT}`);
  }
});
