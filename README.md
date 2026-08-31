# Zuegelofferte

White-Label-WebApp fuer Schweizer Zuegelunternehmen. Besucher erfassen ihren Umzug, hinterlegen vor der Preisansicht ihre Kontaktdaten und erhalten eine automatisch berechnete, unverbindliche Offerte. Das Unternehmen bestaetigt oder korrigiert den Preis erst bei konkretem Kundeninteresse.

Das Repository enthaelt bewusst nur die WebApp und ihre gemeinsame Serverinfrastruktur. Es gibt keine Marketing-Website und keine native Mobile-App.

## Dokumentation

- [Produktkonzept](docs/01-product-concept.md)
- [Living Product Spec](docs/02-spec.md)
- [Technischer Plan](docs/03-technical-plan.md)
- [POC-Testanleitung](docs/04-poc-runbook.md)
- [Release-Konzept](docs/release-concept.md)
- [Backup-Konzept](docs/backup-concept.md)

## Lokale Entwicklung

Voraussetzungen sind die Node-Version aus `.nvmrc`, pnpm aus `packageManager` und Docker.

```sh
docker compose up -d
pnpm install
cp apps/web/.env.example apps/web/.env.development
pnpm dev
```

Die WebApp laeuft standardmaessig unter `http://localhost:3000`; PostgreSQL auf Port `5433` und Mailpit unter `http://localhost:8025`.

Direkte Demo-URLs:

- Kundenrechner: `http://localhost:3000/de/alpenblick`
- Unternehmensansicht: `http://localhost:3000/de/alpenblick/portal`

Die Beispielkonfiguration enthaelt ausschliesslich lokale Werte und Platzhalter. Echte Secrets bleiben in den git-ignorierten Dateien `apps/web/.env.development` beziehungsweise `apps/web/.env.development.local`. Fuer lokale E-Mails koennen diese Werte ergaenzt werden:

```sh
SMTP_HOST=localhost
SMTP_PORT=1025
```

Fuer echte Gemini-Aufrufe ueber Vercel AI Gateway wird lokal der serverseitige `AI_GATEWAY_API_KEY` in `apps/web/.env.development.local` benoetigt; auf Vercel wird automatisch OIDC verwendet. Google Places/Routes verwenden `GOOGLE_MAPS_SERVER_API_KEY`; die optionale eingebettete Karte verwendet einen separat eingeschraenkten `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY`. Ohne diese Keys bleiben Frageflow, Preisengine und der klar bezeichnete manuelle Routen-Fallback lauffaehig.

Der Unternehmensbereich ist in der lokalen Entwicklung offen. Eine explizite Preview-Demo kann ihn mit `POC_DEMO_MODE=true` freischalten; in einem produktiven Betrieb bleibt er bis zur vollstaendigen Membership-Autorisierung gesperrt.

## Qualitaetsgates

```sh
pnpm check:types
pnpm lint
pnpm format
pnpm test
```

Payload-Typen, Datenbankschema und Migrationen werden ueber `pnpm generate` beziehungsweise `pnpm ci` aktualisiert.

## Architekturgrundsaetze

- Preisberechnung bleibt deterministisch und versioniert.
- AI extrahiert und erklaert, setzt aber nie Preise oder Berechtigungen.
- Jeder fachliche Datensatz ist explizit einem Tenant zugeordnet.
- Datenzugriff liegt im Business Layer, nicht in React-Komponenten.
- Externe Provider werden ueber kleine, serverseitige Adapter gekapselt.

Payload und Better Auth liegen unter `submodules/` als optionale lokale Quellreferenz. Die Anwendung verwendet die veroeffentlichten Pakete aus `node_modules`.
