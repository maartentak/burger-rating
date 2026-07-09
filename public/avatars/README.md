# Curator avatars

Drop the three profile pictures here so they show up baked into the app:

```
public/avatars/axel.png
public/avatars/simon.png
public/avatars/marty.png
```

- Filename must be the curator's **lowercase** name + `.png` (or `.jpg` — if you
  use `.jpg`, update the `avatarUrl` values in `src/lib/curators.ts`).
- Square images look best (they're shown in circles).
- If a file is missing, that curator just shows their coloured initial circle —
  nothing breaks.

You can also set/replace any avatar from inside the app:
**Curators → Edit badge → 📷 Photo** (this saves to the database, and overrides
whatever is in this folder for that curator).
