# PLAYER SIGNAL Serverless adapters

The static portfolio uses the local offline demonstration by default. Deployments can route `/api/games` and `/api/reviews` to the handlers in this directory.

## Environment

- `STEAM_WEB_API_KEY`: server-only Steam Web API key used by the scheduled `IStoreService/GetAppList` catalog sync. Never expose it to browser code or logs.
- `PLAYER_SIGNAL_REVIEW_SALT`: server-only salt used to hash recommendation IDs before review responses are constructed.

`/api/games` reads a periodically generated search index through an injected `loadIndex` adapter. `/api/reviews` requests the public Steam Store review endpoint, clamps each page to 100 items, caches a narrowed response and removes the complete author object before returning JSON.

Production adapters should persist the game index and response cache in the deployment platform's storage. Suggested catalog refresh is daily; review cache TTL is five minutes. Configure an explicit allowed-origin list, request timeout and platform rate limit. Recorded-response tests run without network or credentials.

The local static server does not emulate these handlers. Search failure leaves the 3,000-review offline demonstration available through the same frontend schema and analysis pipeline.
