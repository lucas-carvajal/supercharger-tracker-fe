# Soonercharger verification map

This directory is the maintained source for verifying the user-facing behavior of Soonercharger. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `.cursor/skills/verify-soonercharger/helpers/verify launch`.
- Default origin is `http://127.0.0.1:4310`.
- Set `VERIFY_RUN_ID` so concurrent agents do not share state files.
- Run `.cursor/skills/verify-soonercharger/helpers/verify doctor` and require the printed origin, pid, and `{"status":"ok"}`.
- Never drive an instance this run did not start.
- This checkout allows one `next dev` only. If launch reports another server, stop.
- No-backend mode is the default. Live-backend recipes say `VERIFY_BACKEND_URL` is required.

## Driving conventions

- Start every recipe from the baseline state unless its preconditions say otherwise.
- Prefer ARIA names, visible headings, and labeled form fields over CSS selectors.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run HTTP through `helpers/verify curl`.
- Run browser actions against the origin from `helpers/verify origin`.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes the HTML or an ARIA snapshot and a screenshot with Soonercharger identity visible.
- HTTP proof includes the command, status code, and body files under `/tmp/soonercharger-verify-evidence/$VERIFY_RUN_ID`.
- Mutation proof includes a second read of the stored value. Admin import is the only mutation. Skip it unless the backend is disposable.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home](./home.md) covers the landing page, stats placeholders, and the three browse links.
- [Upcoming list](./list.md) covers filters, cards, show more, and the load-error status.
- [Map](./map.md) covers the map canvas, legend filters, popups, and the load-error status.
- [Status updates](./status-updates.md) covers the activity feed, empty state, load more, and the load-error status.
- [Charger detail](./charger-detail.md) covers a site page, breadcrumb, Tesla source link, and the unavailable state.
