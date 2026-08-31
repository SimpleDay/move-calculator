# Zuegelofferte – POC-Testanleitung

Stand: 30. August 2026

## Ziel dieses Stands

Dieser Stand ist eine praesentierbare vertikale Scheibe fuer Pilotgespraeche. Er prueft den Kundennutzen, den Flow, das Kontakt-Gate, die deterministische Preislogik und den Uebergang an das Zuegelunternehmen. Er ist noch kein produktiver Pilotbetrieb.

## Start

```bash
docker compose up -d
pnpm install
cp apps/web/.env.example apps/web/.env.development
pnpm dev
```

- Kundenrechner: `http://localhost:3000/de/alpenblick`
- Unternehmensansicht: `http://localhost:3000/de/alpenblick/portal`
- Payload Admin: `http://localhost:3000/admin`

## Empfohlener Demoablauf

1. Wohnungsumzug von Bern nach Thun erfassen. Mit Maps-Key werden beide Adressen vorgeschlagen, kanonisch bestaetigt und die Route automatisch berechnet; ohne Key bleibt die manuelle Distanz bewusst editierbar.
2. Einen Zugang mit Etage und kleinem Lift, den anderen im Erdgeschoss angeben.
3. `Standard` mit 24 m3 waehlen oder die optionale Fotoanalyse zeigen.
4. Moebelmontage als Zusatzleistung waehlen.
5. Zusammenfassung bestaetigen.
6. Kontaktdaten eingeben und zeigen, dass vorher nirgends ein Preis sichtbar ist.
7. Offerte anzeigen und eine Leistung hinzufuegen oder entfernen.
8. Den einschiebenden Offerten-Assistenten oeffnen und die Preisgrundlage erklaeren lassen.
9. `Preis bestaetigen lassen` anklicken.
10. In die Unternehmensansicht wechseln und die priorisierte Anfrage bestaetigen.
11. Zum Kundenrechner zurueckkehren oder neu laden; der bestaetigte Status wird aus PostgreSQL uebernommen.

## Was echt implementiert ist

- tenant-gebundener, versionierter Browserentwurf mit Autosave und Migration auf das aktuelle Draft-Schema
- adaptiver Fragekatalog fuer Etage und Lift
- drei Inventarwege: Schnellangabe, manuell und Fotoanalyse
- Places-Autocomplete, kanonische Adressen, Routes-Distanz/-Fahrzeit und eingebettete Routenvorschau hinter einem Google-Maps-Adapter
- expliziter manueller Adress- und Distanz-Fallback, falls Maps nicht konfiguriert oder erreichbar ist
- atomare, serverseitige Leadanlage und erste Offertrevision am Kontakt-Gate
- pure, deterministische Preisengine mit Integer-Rappen, MWST, Rundung, Mindestpreis, Zugang, Distanz, Leistungen und Zuschlaegen
- nachvollziehbare Preisbestandteile, Annahmen, Team-, Fahrzeug- und Zeitschaetzung
- sofortige Neuberechnung bei Leistungsanpassungen als neue, unveraenderliche Revision
- serverseitig gehashter Kundenzugriffstoken; der Rohwert wird nicht gespeichert
- priorisierte Unternehmensliste aus PostgreSQL mit exakter Preisprofilversion und Revisionsnummer
- Firmenbestaetigung der exakten Revision und serverseitige Statusrueckgabe an die Kundenansicht
- typisierter Tenant-Preiskonfigurator fuer alle aktuell preiswirksamen Parameter und Leistungen
- getrenntes Speichern als Entwurf und explizites Veroeffentlichen einer unveraenderlichen Preisprofilversion
- Live-Musterpreis im Konfigurator; bestehende Offerten behalten ihren urspruenglichen Preissnapshot
- Chat-Split-View mit sicheren Demo-Aktionen; der Chat setzt nie selbst einen Preis

## Google Maps

Fuer echte Adressvorschlaege, Place Details und Routes wird serverseitig ein Key benoetigt. Fuer die interaktive Routenvorschau ist ein separat einschraenkbarer Browser-Key vorgesehen:

```bash
GOOGLE_MAPS_SERVER_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=...
```

Der Server-Key darf nie als `NEXT_PUBLIC_*` exponiert werden. Im Google-Cloud-Projekt muessen Places API (New) und Routes API aktiviert sein; fuer den Browser-Key Maps Embed API. Beide Keys sollen separat auf die benoetigten APIs beziehungsweise Website-Origins eingeschraenkt werden. Ohne Keys bleibt der gesamte Offertflow mit einem klar bezeichneten manuellen Fallback nutzbar.

## Gemini-Fotoanalyse

Der Serveradapter nutzt Vercel AI SDK Core, Vercel AI Gateway und `google/gemini-3.7-flash`. Fuer einen echten lokalen Aufruf in der git-ignorierten Datei `apps/web/.env.development.local` setzen:

```bash
AI_GATEWAY_API_KEY=...
```

Auf Vercel wird automatisch OIDC verwendet; dort ist kein langlebiger App-Key notwendig. `google/gemini-3.7-flash` bleibt der feste Default. Fuer einen bewusst begrenzten lokalen Gateway-Test kann `AI_INVENTORY_MODEL_ID` temporaer ein anderes freigegebenes Gemini-Modell setzen; diese Variable gehoert nicht in die produktive Vercel-Konfiguration.

Ohne lokale Authentifizierung meldet die Fotoerfassung kontrolliert, dass die Analyse nicht konfiguriert ist. Der Kunde kann ohne Datenverlust manuell fortfahren. AI-Ergebnisse werden gegen ein fixes Inventarschema validiert und erhalten ihr Volumen ausschliesslich aus dem lokalen Katalog.

## Bewusste POC-Grenzen

- Der anonyme Entwurf vor dem Kontakt-Gate liegt weiterhin nur tenant-spezifisch im Local Storage; Quote, Kontaktdaten und Revisionen liegen danach in PostgreSQL.
- Der Portalzugang ist lokal beziehungsweise mit `POC_DEMO_MODE=true` fuer eine bewusst freigeschaltete Preview-Demo offen. Produktive Session-/Membership-Autorisierung ist noch nicht verdrahtet.
- Ein echter Magic-Link-Versand und transaktionale E-Mails fehlen noch; der lokale Kundenzugriff funktioniert bereits mit einem nur gehasht gespeicherten Token.
- Fotoanalysen werden synchron verarbeitet und Bilder nicht gespeichert; private Upload-Sessions und Hintergrundjobs folgen vor dem Pilot.
- Der freie Chat ist noch nicht mit Gemini verbunden; nur klar markierte, validierte Demo-Aktionen mutieren die Offerte.
- PDF, Firmen-Preisaenderung und Kundenannahme sind noch nicht aktiv.
- Rate Limits, Retention, Consent-Audit und produktive Benachrichtigungen fehlen noch.

Diese Grenzen sind in der UI entweder benannt oder deaktiviert. Es wird keine produktive Genauigkeit, Zustellung oder Persistenz vorgetaeuscht.

## Naechster technischer Slice vor echten Kundendaten

1. Better-Auth-Session und Tenant-Membership als zwingende Portal-Autorisierung verdrahten, inklusive positiver und negativer Isolationstests mit zwei Tenants.
2. E-Mail-Magic-Link, PDF und Benachrichtigungs-Outbox implementieren.
3. Private Medienuploads, asynchronen Analysejob und Golden-Dataset-Evaluation ergaenzen.
4. Freien Gemini-Chat nur ueber validierte Quote-Tools anbinden, inklusive Vorschau, Preisdelta und Undo.
5. Rate Limits, Retention, Consent-Audit, Loeschung und Provider-Monitoring haerten.
6. Mit historischen Pilotdaten mindestens drei Vergleichsfaelle pro Preisprofil kalibrieren.

## Qualitaetspruefung

```bash
pnpm check:types
pnpm lint
pnpm format
pnpm test
pnpm build
```

Der sichtbare Flow wird zusaetzlich auf Desktop und Mobile komplett durchgespielt. Ein gruenes Build ersetzt diese UX-Pruefung nicht.
