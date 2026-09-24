# PLAYER SIGNAL offline demonstration data

The offline demonstration uses Steam public reviews for No Man's Sky (`appid 275850`). It exists so the portfolio remains usable when the live Serverless adapter or its upstream source is unavailable.

The review document records its retrieval time, request URL, page count and accepted record count. Version dates and names come from official No Man's Sky release posts. The cached sample is for product demonstration and deterministic regression testing; it is not a permanent mirror of Steam community profiles.

## Privacy treatment and removed fields

Before a record is written, the ingestion script removes the complete Steam author object. Removed fields include SteamID, player name, profile URL, avatar URLs, ownership flags and account-level metadata. The public record retains only a salted SHA-256 review hash, review text, creation time, recommendation status, playtime minutes, helpful votes and language. Steam profile links and 17-digit identifiers found inside free text are replaced with `[redacted]`.

## Provenance

- Game: No Man's Sky
- Steam AppID: `275850`
- Review source: `https://store.steampowered.com/appreviews/275850`
- Version sources: official posts on `nomanssky.com`
- Locale: English
- Cache purpose: offline demonstration and tests

The interface labels the dataset as an offline snapshot and displays its recorded retrieval timestamp. Version proximity is presented as correlation, never as proof that an update caused a player report.

## Curated offline case catalog

`offline-cases.json` adds eight compact, anonymous classic-game cases: Portal 2, The Witcher 3: Wild Hunt, Hades, Stardew Valley, Slay the Spire, Disco Elysium, Hollow Knight and Outer Wilds. These are curated demonstration fixtures, separate from the No Man's Sky snapshot and live Steam data. Each case carries a small review sample plus role signals for product, content, narrative, systems and creative-technology discussions.
