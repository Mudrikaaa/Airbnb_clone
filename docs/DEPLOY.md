# Deployment

## Settings
**Railway (backend)** — Root Directory `backend`; volume mounted at `/data`; start command comes from `backend/Procfile`
(`uvicorn app.main:app --host 0.0.0.0 --port $PORT`) — leave "Custom Start Command" empty.

| Variable | Value |
|---|---|
| `DATABASE_URL` | `sqlite:////data/airbnb.db` |
| `FRONTEND_ORIGIN` | `http://localhost:3000,https://airbnb-clone-xk2g.vercel.app` |

**Vercel (frontend)** — Root Directory `frontend`; `NEXT_PUBLIC_API_URL=https://airbnbclone-production-beea.up.railway.app` (redeploy after changing).

## One-time production reset (reseed)
The seed only runs on an empty database, so to load the current seed data into the existing volume:
1. Railway → backend service → **Settings → Deploy → Custom Start Command**, set:
   `sh -c "python -m app.seed.seed --reset && uvicorn app.main:app --host 0.0.0.0 --port $PORT"`
   (the `sh -c` is required: without a shell, `&&` is passed to the program as an argument and the deploy crashes).
2. Deploy and open **Deployments → View logs**; wait for "Seeded database." then "Uvicorn running".
3. **Set the start command back**: clear the field (so the Procfile applies) and redeploy.
   If you leave the reset command in place, every deploy wipes all bookings.

## Smoke test (deployed links)
1. `<API>/api/health` returns `{"status":"ok","db":"ok"}`.
2. `<API>/api/listings?page_size=1` shows `"total": 49`.
3. Open the Vercel URL: the grid loads with photos and no CORS errors in the console.
4. Click a category, then open Filters, pick a price range and a property type; the count updates and the URL changes.
5. Search "Goa" with dates and 2 guests; results narrow.
6. Open a listing: gallery, calendar with struck-through booked days, map, reviews load.
7. Profile menu → Log in as Rohan Gupta; heart a listing (toast), see it under Wishlists.
8. Reserve free dates → Confirm and pay → toast; the trip shows under Trips; the same dates are now disabled on the listing.
9. Cancel that trip; the dates are free again. Try booking overlapping dates of an existing stay: error message (409).
10. Log in as Aarav Mehta → Switch to hosting: Today and Listings load; create a listing, edit it, delete it (toast each time); deleting a listing with upcoming reservations is refused.
