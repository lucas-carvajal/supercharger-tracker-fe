#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const catalogPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/catalog.json",
);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
if (!Array.isArray(catalog.chargers) || !Array.isArray(catalog.updates)) {
  throw new Error("catalog.json must have chargers and updates arrays");
}

const host = process.env.VERIFY_MOCK_HOST || "127.0.0.1";
const port = Number.parseInt(process.env.VERIFY_MOCK_PORT || "4311", 10);

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

function pageParams(url) {
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "20", 10);
  const offsetRaw = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  return {
    limit: Number.isFinite(limitRaw) && limitRaw >= 0 ? limitRaw : 20,
    offset: Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0,
  };
}

function withoutHistory(charger) {
  const item = { ...charger };
  delete item.status_history;
  return item;
}

function listResponse(url) {
  const status = url.searchParams.get("status");
  const country = url.searchParams.get("country");
  const countryFilter = country ? country.toUpperCase() : null;
  const filtered = catalog.chargers.filter((charger) => {
    if (status && charger.status !== status) return false;
    if (
      countryFilter &&
      String(charger.country ?? "").toUpperCase() !== countryFilter
    ) {
      return false;
    }
    return true;
  });
  const { limit, offset } = pageParams(url);
  return {
    total: filtered.length,
    items: filtered.slice(offset, offset + limit).map(withoutHistory),
  };
}

function statsResponse() {
  const by_status = {};
  for (const charger of catalog.chargers) {
    by_status[charger.status] = (by_status[charger.status] ?? 0) + 1;
  }
  return {
    total_active: catalog.chargers.length,
    by_status,
    as_of: catalog.chargers[0]?.last_scraped_at ?? null,
  };
}

function mapResponse() {
  return catalog.chargers.map((charger) => {
    const item = {
      id: charger.id,
      title: charger.title,
      latitude: charger.latitude,
      longitude: charger.longitude,
      status: charger.status,
      country: charger.country,
    };
    if (charger.num_charger_stalls !== undefined) {
      item.num_charger_stalls = charger.num_charger_stalls;
    }
    return item;
  });
}

function updatesResponse(url, requireOldStatus) {
  const source = requireOldStatus
    ? catalog.updates.filter((item) => item.old_status !== null)
    : catalog.updates;
  const { limit, offset } = pageParams(url);
  return {
    total: source.length,
    items: source.slice(offset, offset + limit),
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host || `${host}:${port}`}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method !== "GET") {
    send(res, 404, { error: "not found" });
    return;
  }

  if (pathname === "/health") {
    send(res, 200, { status: "ok" });
    return;
  }

  if (pathname === "/superchargers/soon") {
    const country = url.searchParams.get("country");
    if (country && !/^[A-Za-z]{2}$/.test(country)) {
      send(res, 400, { error: `invalid country: ${country}` });
      return;
    }
    send(res, 200, listResponse(url));
    return;
  }

  if (pathname === "/superchargers/soon/stats") {
    send(res, 200, statsResponse());
    return;
  }

  if (pathname === "/superchargers/soon/map") {
    send(res, 200, mapResponse());
    return;
  }

  if (pathname === "/superchargers/soon/recent-updates") {
    send(res, 200, updatesResponse(url, false));
    return;
  }

  if (pathname === "/superchargers/soon/recent-changes") {
    send(res, 200, updatesResponse(url, true));
    return;
  }

  if (pathname.startsWith("/superchargers/soon/")) {
    const id = decodeURIComponent(pathname.slice("/superchargers/soon/".length));
    const charger = catalog.chargers.find((item) => item.id === id);
    if (!charger) {
      send(res, 404, { error: "not found" });
      return;
    }
    send(res, 200, charger);
    return;
  }

  send(res, 404, { error: "not found" });
});

server.listen(port, host);
