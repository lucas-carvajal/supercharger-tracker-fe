# Home

Home is the public landing page. A visitor sees the Soonercharger heading, three buildout stats, and links into the list, map, and status updates.

## Sub-features

- `home-open` renders the landing page from each supported entry point.
- `home-stats` shows coming soon, under construction, and in development counts, or an em dash when the backend is down.
- `home-browse-list` opens the upcoming list from the landing CTA.
- `home-browse-map` opens the map from the landing CTA.
- `home-browse-updates` opens status updates from the landing CTA.
- `home-brand` returns home from the header brand control.

## How to get to it (user POV)

- Open `/` in the browser.
- Choose the header control named `Soonercharger home`.
- Open `http://127.0.0.1:4310/` with HTTP.

## Driving it with verify

Preconditions:

- Doctor reports the expected origin and `{"status":"ok"}`.
- Fixture mode is enough for every sub-feature except the none-mode em dash proof.

- **HTTP open.** Fetch the landing page. Run `.cursor/skills/verify-soonercharger/helpers/verify curl /`. Status is `200`. The body contains `Soonercharger`, `Tesla Supercharger Buildout Tracker`, `Browse the list`, `Open the map`, and `Status updates`.
- **Browser open.** Open `{origin}/`. The heading is `Soonercharger`. The eyebrow reads `Tesla Supercharger Buildout Tracker`. Home does not need to contain `Riverside Plaza`.
- **Stats in fixture mode.** Labels are `coming soon`, `under construction`, and `in development`. Values are `4`, `2`, and `2`.
- **Stats without backend.** With `VERIFY_MODE=none`, each stat value is `—`.
- **List CTA.** Choose `Browse the list`. The document heading becomes `All upcoming Superchargers` and the URL is `/list`.
- **Map CTA.** Return home, then choose `Open the map`. The URL is `/map`.
- **Updates CTA.** Return home, then choose `Status updates`. The document heading becomes `Charger Status Updates` and the URL is `/status-updates`.
- **Brand home.** From `/list`, choose the control named `Soonercharger home`. The URL is `/` and the heading is `Soonercharger` again.
- **Proof.** Save the HTTP body from `curl /` and a screenshot of the landing heading plus the three CTAs. Both artifacts show `Soonercharger`.

## Gotchas

- Home still returns 200 when the backend is down. Treat `—` as the `VERIFY_MODE=none` proof, not a failure.
- The brand word `Soonercharger` is `sr-only` on small viewports. Use `aria-label="Soonercharger home"` or a desktop width.
- Primary nav labels are `List`, `Map`, and `Updates`. The landing CTAs use the longer strings. Do not mix them up.
- Count-up animation only plays once per document lifetime. Reload if you need to watch it again.
