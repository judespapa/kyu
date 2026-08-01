# kyu

Create and share creative vacation albums with family — while you’re still on the trip.

kyu runs on your laptop (or this machine) and lets everyone on the same Wi‑Fi join with a short invite code. No accounts.

## Features

- Create a shared album with a mood + layout
- Join with a 6-character invite code
- Upload photos from phone camera rolls
- Captions + contributor names
- Creative layouts: mosaic, film strip, tilted stack
- Family share links for the local network

## Quick start

```bash
npm install
cd client && npm install && cd ..
npm run dev
```

- App UI: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8787](http://localhost:8787)

On vacation Wi‑Fi, start kyu on one device and share the LAN URL printed in the terminal (or shown in the app) plus the album invite code.

## Production-style local run

```bash
npm start
```

Serves the built client from the Express server on port `8787` (bound to `0.0.0.0` so phones on the same network can connect).

## Notes

- Photos and album data are stored in `data/` on the machine running the server
- Keep that device awake while family is adding photos
- Great for same-network trips; for internet sharing you’d deploy the server somewhere public later
