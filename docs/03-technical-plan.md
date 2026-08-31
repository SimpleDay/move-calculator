# Zuegelofferte – Technischer Plan

Status: Living Architecture und Lieferplan; Slices 0–3 teilweise umgesetzt  
Stand: 30. August 2026

## 1. Ausgangslage

Das neue Projekt basiert auf `devedis/devedis-template`, liegt getrennt von `devedis-web` und wird mit einer eigenen, frischen Historie unter `SimpleDay/move-calculator` weiterentwickelt.

Referenzen:

- Template: `https://github.com/devedis/devedis-template`
- bisheriger Rechner: `https://github.com/devedis/devedis-web`
- neues Produkt-Repository: `https://github.com/SimpleDay/move-calculator`

Der bisherige Kostenrechner umfasst rund 23'500 Zeilen und ist stark mit Website-CMS, Projektkostenschaetzung und bestehender AI-Generierung verbunden. Er wird nicht als Ganzes kopiert.

### Aktueller Implementierungsstand

- Repository-Fundament, fokussierte WebApp, Demo-Tenant und deterministische Preisengine sind umgesetzt.
- Der Kundenflow persistiert vor dem Kontakt-Gate lokal und danach atomar als `quote` plus unveraenderliche `quoteRevision` in PostgreSQL.
- Kundenzugriffstokens werden gehasht gespeichert. Preisrelevante Aenderungen erzeugen eine neue Revision mit dem dann aktiven Preisprofilsnapshot.
- Google Places (New), Place Details und Routes sind hinter einem Provideradapter angebunden; ohne Konfiguration greift ein expliziter manueller Fallback.
- Der Tenant-Konfigurator deckt alle aktuell preiswirksamen Parameter ab, speichert einen Entwurf und veroeffentlicht unveraenderliche Versionen.
- Die Firmenansicht priorisiert Bestaetigungsanfragen und bestaetigt nur die konkret angezeigte Revision.
- Noch offen vor echten Kundendaten sind insbesondere produktive Portal-Authentisierung, Magic-Link-Versand, PDF, private Medienjobs, AI-Chat, Rate Limits und Retention.

## 2. Vom Template beibehalten

- Next.js-App-Router-Anwendung
- TypeScript und bestehende Coding-Regeln
- Payload mit PostgreSQL
- Better Auth, E-Mail-Verifikation und Einladungen
- transaktionale Business-Layer-Konvention
- GCS-Medienablage
- E-Mail-Templates
- Sentry-Integration
- Vitest-Aufteilung in Unit-, DOM- und DB-Tests
- Format-, Lint-, Typecheck- und CI-Gates

Fuer die erste Version nicht benoetigte Template-Bereiche wie Mobile-App, generischer Seitenbaukasten und Marketing-Website werden kontrolliert entfernt. Payload bleibt als Daten- und Plattform-Admin erhalten; Tenant-Mitarbeiter erhalten eine zweckmaessige eigene Portaloberflaeche.

## 3. Selektive Wiederverwendung aus dem bestehenden Rechner

Als Referenz oder Ausgangspunkt geeignet:

- schrittbasierter Reducer und Navigation
- validierte, versionierte Browser-Persistenz
- Fortschrittsanzeige und reduzierte Bewegungsunterstuetzung
- sichere Share-/Magic-Link-Idee
- Upload-Policy und direkte Uploads
- Ergebnis-Konfigurator mit sofortiger Preisaktualisierung
- Chat-Eingabe und einschiebbare Interaktionsidee
- vorhandene Testmuster fuer Flow, Persistenz und Ergebnisanpassung

Bewusst neu entwickeln:

- fachliches Umzugsmodell
- Preisengine
- Offertstatus und Revisionen
- Tenant- und Membership-Modell
- Kunden- und Unternehmensportal
- Inventar- und Medienanalyse
- Chatwerkzeuge

Nicht uebernehmen:

- bestehende Projektkosten-Prompts und AI-generierte Fragen
- Website-CMS-Abhaengigkeiten
- Tagesansatz-/Personentage-Kalkulation
- devedis-spezifisches Tracking und Lead-Payload
- Aurora-/Glass-Branding als fertiges Design
- grosse Komponenten ohne fachliche Trennung

## 4. Zielarchitektur

Eine modulare Anwendung, kein Microservice-System:

```text
Next.js WebApp
  - Public Quote Flow
  - Customer Quote Workspace
  - Tenant Portal
  - Platform Admin via Payload

Business Layer
  - tenants
  - quotes
  - pricing
  - inventory
  - mediaAnalysis
  - conversations
  - notifications

PostgreSQL + Payload
Object Storage
Provider Adapter
  - Maps
  - AI
  - Email
  - PDF
```

Externe Provider werden hinter kleinen, fachlichen Adaptern gekapselt. Fuer den POC wird jeweils nur ein Provider implementiert.

## 5. Kern-Datenmodell

| Entitaet                | Zweck                                               |
| ----------------------- | --------------------------------------------------- |
| `tenant`                | Zuegelunternehmen und Plattformmandant              |
| `tenantMembership`      | Benutzer, Tenant und Rolle                          |
| `tenantBranding`        | Logo, Farben, Domain und Sprache                    |
| `depot`                 | Ausgangspunkt fuer An- und Rueckfahrt               |
| `pricingProfile`        | bearbeitbare Preisparameter                         |
| `pricingProfileVersion` | unveraenderliche, veroeffentlichte Version          |
| `serviceDefinition`     | buchbare Leistung und Preisbaustein                 |
| `inventoryCatalogItem`  | Gegenstand, Volumen und Handhabungsmerkmale         |
| `quote`                 | Lead, aktueller Status und Tenant-Zuordnung         |
| `quoteRevision`         | unveraenderlicher Daten-, Preis- und Regel-Snapshot |
| `location`              | validierte Adresse und Zugangsangaben               |
| `inventoryItem`         | kundenbestaetigter Umzugsgegenstand                 |
| `quoteMedia`            | Foto oder Video mit Analysezustand                  |
| `conversation`          | Chat zur Offerte                                    |
| `conversationMessage`   | Nachricht oder nachvollziehbarer Werkzeugaufruf     |
| `auditEvent`            | sicherheits- und offertrelevante Aenderung          |

Kontaktdaten gehoeren zum Lead und werden nicht als normales Plattform-Benutzerkonto modelliert.

## 6. Multi-Tenancy

- Jede fachliche Entitaet traegt eine nicht optionale `tenantId`.
- Jeder Business-Layer-Aufruf erhaelt einen expliziten Tenant-Kontext.
- Tenant-Zugriff wird serverseitig aus Session und Membership bestimmt, nie aus einem Client-Feld vertraut.
- Public-Endpunkte leiten den Tenant aus einem serverseitig aufgeloesten Slug oder Host ab.
- Dateipfade, Cachekeys, Jobs und Auditlogs sind tenant-gebunden.
- Plattformrollen und Tenantrollen bleiben getrennt.
- Kritische Zugriffe erhalten negative Isolationstests mit zwei Tenants.

Vorgesehene Tenantrollen:

- `owner`
- `admin`
- `estimator`
- `viewer`

Die globalen Template-Rollen reichen dafuer nicht aus und werden nicht als Tenantberechtigung missbraucht.

## 7. Preisengine

Die Preisengine ist eine pure, deterministische TypeScript-Domainfunktion. Sie kennt weder UI noch AI noch Payload.

### 7.1 Einsatzplanung vor Preisbildung

Die Engine ist in zwei explizite Stufen getrennt:

```text
MoveInput + PricingProfile
  -> deriveOperationalPlan
  -> priceOperationalPlan
  -> QuoteCalculation
```

`deriveOperationalPlan` berechnet zuerst Handhabungszeit, echte oder ersatzweise geschaetzte Fahrzeit, Teamoption,
Fahrzeuganzahl, Kapazitaetsfahrten und Flottenkilometer. Team und Fahrzeuge werden aus den vom Tenant erlaubten
Optionen so gewaehlt, dass die konfigurierte maximale Einsatzdauer eingehalten und innerhalb der machbaren Plaene
der guenstigste direkte Einsatz gewaehlt wird. Weitere Personen erhalten einen konfigurierbaren Effizienzfaktor;
dadurch wird ein groesseres Team schneller, aber nicht unrealistisch linear produktiver.

Ein knappes Ueberschreiten der Fahrzeugkapazitaet erzwingt nicht mehr automatisch ein zweites Fahrzeug. Die Engine
vergleicht mehrere Fahrten mit parallelen Fahrzeugen und respektiert dabei die maximale Anzahl Fahrten pro Fahrzeug.
Google-Routenzeit wird verwendet, wenn sie vorliegt; Kilometer und Tenant-Fahrzeitmodell bleiben der explizite
Fallback. Kartonmenge und Umzugsart wirken nun ebenfalls auf den Handhabungsaufwand.

`priceOperationalPlan` bepreist erst den gewaehlten Einsatz. So bleiben operative Annahmen getrennt von Stunden-,
Fahrzeug-, Distanz-, Leistungs-, Zuschlags-, MWST- und Rundungsregeln.

### 7.2 Unsicherheit und gezielte Pruefung

Jede Berechnung fuehrt zusaetzlich begrenzte Szenarien fuer Volumen und Route aus. Die Unsicherheitsbreite ist pro
Erfassungsart und Tenant konfigurierbar. Gespeichert werden:

- interne minimale und maximale Pruefspanne
- Preiswirkung je Unsicherheitsfaktor
- Wechsel von Team, Fahrzeug oder Fahrten innerhalb der plausiblen Spanne
- Qualitaetsstufe `high`, `medium` oder `low`
- explizite Empfehlung fuer eine Firmenpruefung

Der Kunde erhaelt weiterhin genau einen unverbindlichen Preis und einen ruhigen Hinweis zur Datenbasis. Das
Unternehmensportal zeigt dagegen Pruefspanne und wichtigsten Grund. Diese Spanne ist keine statistisch validierte
Konfidenz und darf nicht als gemessene Genauigkeit beworben werden. Dafuer werden spaeter bestaetigte und effektiv
ausgefuehrte Auftraege benoetigt.

Eingaben:

- veroeffentlichte Preisprofilversion
- Route und Fahrtzeiten
- Start-/Zielzugang
- Inventarvolumen und Handhabungsklassen
- Leistungen und Spezialgegenstaende
- Datum und tenant-spezifische Zuschlaege

Ausgaben:

- Gesamtpreis
- interne Preisbestandteile
- kundensichtbare Preisbestandteile
- Team-, Fahrzeug- und Zeitschaetzung
- verwendete Annahmen und Regelversion

Jede Berechnung wird als `quoteRevision` gespeichert. Geldwerte werden als Integer in Rappen gespeichert. Rundung und MWST erfolgen explizit und testbar.

Die Engine startet mit strukturierten Bausteinen und begrenzten Bedingungen. Eine universelle Formelsprache wird erst gebaut, wenn die drei Pilotunternehmen einen echten Bedarf dafuer belegen.

## 8. Persistenz und Zugriff

### Anonymer Entwurf

- tenant-spezifischer, versionierter Local-Storage-Entwurf
- zufaellige Draft-ID
- anonyme Upload-Session mit kurzer Gueltigkeit
- keine PII vor dem Kontakt-Gate notwendig

### Gespeicherte Offerte

- serverseitiges Quote-Objekt nach Kontakt-Gate
- hochentropischer Magic-Link-Token; serverseitig nur Hash speichern
- Tokenrotation und Widerruf bei Missbrauch
- Rate Limits fuer Leadanlage, Tokenpruefung, Chat und Uploads
- nachvollziehbare Einwilligungs- und Datenschutzhinweise

## 9. Erfassung, Klassifikation und AI

### 9.1 Produktentscheidung: gefuehrter Hybrid statt freier Agent

Der Kundenflow ist **kein Chatbot, der selbst entscheidet, welche Daten am Ende vorhanden sind**. Die Anwendung besitzt ein kanonisches, versioniertes Umzugsdatenschema und einen deterministischen Flow-Controller. Dieser kennt:

- die immer erforderlichen Kerndaten
- die vom Tenant aktivierten Fragen und Leistungen
- fachliche Folgefragen und Ausschlussbedingungen
- bereits beantwortete Felder
- Unsicherheiten aus Medienanalysen
- die Mindestdaten fuer eine belastbare Kalkulation

Gemini ist ein Erfassungsassistent innerhalb dieses Rahmens. Die AI darf mehrere Antworten auf einmal extrahieren, Inventar aus Medien vorschlagen, Unklarheiten erklaeren und im Offertchat validierte Werkzeuge aufrufen. Sie bestimmt aber weder den fachlichen Status noch den Preis.

Diese Aufteilung ist fuer die UX besser als beide Extreme:

- Ein komplett statischer Fragebogen ist verlaesslich, wird aber lang und fragt oft Irrelevantes.
- Ein freier AI-Agent wirkt flexibel, kann aber Fragen vergessen, Aussagen falsch interpretieren und ist schwer reproduzierbar.
- Der Hybrid zeigt stabile, schnell beantwortbare UI-Elemente und setzt AI dort ein, wo sie messbar Eingabezeit spart.

### 9.2 Kanonisches Datenschema

Alle Eingabewege schreiben auf dieselben fachlichen Felder:

```text
MoveDraft
  tenantId
  moveType
  schedule
  stops[]
    address
    access
  inventory[]
    catalogItemId
    room
    quantity
    volumeM3
    handlingFlags[]
    source
    confidence
    evidenceMediaIds[]
    confirmedByCustomer
  services[]
  contact
  customerAttestation
```

`source` unterscheidet mindestens `manual`, `quickEstimate`, `photo`, `video`, `text` und `company`. AI-Ergebnisse werden immer als Vorschlag gespeichert und erst nach Kundenbestaetigung zu kalkulationsrelevanten Daten.

### 9.3 Adaptiver Fragekatalog

Der Fragekatalog besteht aus kleinen, stabilen Fragegruppen. Ein reiner Regel-Resolver berechnet aus Draft und Tenant-Konfiguration die naechste notwendige Frage.

Beispiele:

- Nur bei einer Etage groesser null nach Lift fragen.
- Nur bei nicht nutzbarem Lift nach Treppenbreite oder Moebellift fragen.
- Nur bei Stadtlagen nach Halteverbotszone fragen, sofern der Tenant diese Leistung anbietet.
- Nur bei einem Klavier die Art, Etage und Tragestrecke vertiefen.
- Bei sicher erkannten Standardmoebeln keine zusaetzliche Einzelabfrage zeigen.
- Bei niedriger Erkennungssicherheit eine konkrete Bestaetigung statt einer allgemeinen Rueckfrage zeigen.

Die Reihenfolge wird nicht von Gemini erfunden. Sie kann spaeter anhand gemessener Abbruchraten optimiert werden, ohne Preis- oder Datenvertraege zu veraendern.

### 9.4 Medienklassifikation

Pipeline fuer Fotos und kurze Videos:

```text
Upload-Session
  -> Dateityp, Groesse und Malware-Risiko pruefen
  -> private, tenantgebundene Speicherung
  -> Analysejob mit Medien-IDs starten
  -> Gemini liefert schema-validierten Inventarvorschlag
  -> Katalog-Normalisierung und Plausibilitaetsregeln
  -> Confidence- und Coverage-Auswertung
  -> Kunde bestaetigt eine visuelle Checkliste
  -> bestaetigtes Inventar fliesst in die Preisengine
```

Gemini liefert pro Vorschlag Gegenstand, Menge, Raum, sichtbare Merkmale, Handhabungsflags, Unsicherheit und Evidenzreferenz. Die Anwendung ergaenzt den tenantunabhaengigen Volumenkatalog. Das Modell soll Volumen nicht frei schaetzen, wenn ein Katalogwert vorhanden ist.

Wichtige UX-Regeln:

- Raumweise Aufnahme mit einem einfachen Fortschritt wie `Wohnzimmer 1/4`.
- Vor der Aufnahme drei kurze Hinweise: Totale, Schrankinhalt/Kartons und verdeckte Bereiche.
- Analyse laeuft im Hintergrund; der Nutzer kann den naechsten Raum erfassen.
- Ergebnis als bearbeitbare Karten mit Bildausschnitt, Menge und klarer Unsicherheitsmarkierung.
- Sammelaktion `Alles stimmt` plus schnelle Plus-/Minus-Korrektur.
- Explizite Abschlussfragen fuer Keller, Estrich, Garage, Balkon und nicht sichtbaren Schrankinhalt.
- Jederzeit Wechsel zur manuellen Liste; kein AI-Zwang und kein Sackgassen-Flow.

### 9.5 Gemini 3.7 Flash via Vercel AI SDK

Geplanter Provider fuer den POC:

- Vercel AI SDK Core: `ai`
- Vercel AI Gateway als providerneutrale Modellschicht
- Modell-ID: `google/gemini-3.7-flash`
- Aufruf ausschliesslich serverseitig
- lokal ein dedizierter, budgetierter Server-Key `AI_GATEWAY_API_KEY`; auf Vercel automatische OIDC-Authentifizierung
- providerneutrales fachliches Interface, damit spaeter Vertex AI oder ein anderes Modell ohne Umbau der Domain eingesetzt werden kann

Einsatz nach Aufgabe:

| Aufgabe                           | AI-SDK-Modus                       | Thinking | Ergebnis                           |
| --------------------------------- | ---------------------------------- | -------- | ---------------------------------- |
| Foto-/Video-Inventar              | `generateText` mit `Output.object` | `low`    | validiertes Inventarschema         |
| Freitext in Umzugsdaten           | `generateText` mit `Output.object` | `low`    | Feldvorschlaege und Unsicherheiten |
| Offertchat                        | `streamText` mit begrenzten Tools  | `low`    | Text und Werkzeugaufrufe           |
| schwierige Plausibilitaetsanalyse | Hintergrundjob                     | `medium` | Warnungen, nie Preis               |

`temperature`, `top_p` und `top_k` werden bei Gemini 3.7 nicht gesetzt. Das Thinking-Level wird explizit ueber `providerOptions.google.thinkingConfig.thinkingLevel` gesteuert. Rohes Modell-Reasoning wird weder benoetigt noch gespeichert.

Die Google-Schemaeinschraenkungen werden im AI-Adapter beruecksichtigt. Insbesondere werden unnoetig komplexe Unions und Records in Modell-Ausgabeschemas vermieden. Das vollstaendige Ergebnis wird nach dem Provider nochmals mit dem Domain-Zod-Schema validiert.

### 9.6 Chatwerkzeuge

AI-Aufgaben im Offertchat:

- Fragen zur bestehenden Offerte beantworten
- Annahmen und Preisbestandteile aus der gespeicherten Revision erklaeren
- Nutzerabsicht in erlaubte Werkzeugaufrufe uebersetzen
- bei Unsicherheit gezielt an das Unternehmen uebergeben

Erste Werkzeuge:

- `getQuoteSummary`
- `explainPriceComponent`
- `addService`
- `removeService`
- `updateMoveDate`
- `updateAccess`
- `addInventoryItem`
- `removeInventoryItem`
- `requestCompanyConfirmation`
- `handoffToCompany`

AI darf nicht:

- Preise frei generieren oder direkt setzen
- Tenantgrenzen oder Berechtigungen bestimmen
- Offerten im Namen der Firma bestaetigen
- unvalidierte Daten direkt speichern
- eigene Werkzeuge oder Felder erfinden
- eine Mutation ausfuehren, die ausserhalb der aktuellen Offerte liegt

Jeder Werkzeugaufruf wird mit Zod validiert, serverseitig autorisiert, mit einer Idempotency-ID ausgefuehrt und auditiert. Mutationen liefern zuerst eine fachliche Aenderung, die Preisengine erzeugt daraus eine neue Revision. Die UI zeigt Aenderung, Preisdelta und Rueckgaengig-Aktion. Sicherheitskritische oder mehrdeutige Aenderungen verlangen eine explizite Bestaetigung.

### 9.7 Qualitaetsmessung der Klassifikation

Eine AI-Demo gilt nicht als produktionsreif, nur weil einzelne Fotos gut aussehen. Fuer die drei Piloten entsteht ein anonymisierter Golden Dataset mit echten, manuell bestaetigten Raeumen.

Gemessen werden:

- Trefferquote pro Gegenstandsklasse
- Mengenabweichung
- Volumenabweichung nach Kundenkorrektur
- Anteil der Vorschlaege, die unveraendert bestaetigt werden
- fehlende Spezialgegenstaende
- Zeit bis zum bestaetigten Inventar
- Latenz, Tokenverbrauch und Kosten pro Offerte
- Rate von Schema- oder Toolfehlern

Prompts, Modell-ID, AI-SDK-Version und Schemas werden versioniert. Eine Modellaktualisierung wird zuerst gegen dieses Dataset bewertet.

## 10. Design- und Komponentenstrategie

- ein fokussiertes, responsives App-Shell-Layout
- kleine Feature-Komponenten statt eines monolithischen Flow-Components
- Formularschema und Preisparameter bleiben fachlich getrennt
- gemeinsame Primitives fuer Schritt, Auswahlkarte, Zusammenfassung, Preis und Status
- Chatlayout als eigenstaendige, wiederverwendbare Split-View-Komponente
- Tenant-Theming ueber validierte Design-Tokens, nicht ueber beliebiges CSS
- Ergebnis-HTML ist die Source of Truth fuer die Kundenansicht; PDF nutzt denselben fachlichen Snapshot

Die erste Designrunde wird direkt als interaktive, responsive Route umgesetzt. So werden Bedienung, Bewegung und Chatlayout gemeinsam statt als statisches Bild beurteilt.

## 11. Teststrategie

### Unit

- Preisengine mit Tabellenfaellen je Pilotunternehmen
- Offertstatus und erlaubte Transitionen
- Revisionsbildung und Rundung
- Tenant-Kontext und Regelauflosung
- Chatwerkzeug-Validierung
- Local-Storage-Migration

### DOM

- kompletter Kundenflow
- Kontakt-Gate vor Preisansicht
- Autosave und Fortsetzung
- Offertanpassung und Preisupdate
- Chat Split View und Tastaturbedienung
- Unternehmenspruefung

### Datenbank

- Tenantisolation
- Magic-Link-Zugriff
- transaktionale Revisionserstellung
- Firmenbestaetigung und konkurrierende Aenderungen

### End-to-End

- Kunde berechnet Offerte und fordert Bestaetigung an
- Firma bestaetigt oder aendert
- Kunde sieht neue Revision und nimmt an
- mobile visuelle Regression fuer Kernschritte

Vor jedem lieferbaren Stand gelten die Template-Gates fuer Typen, Lint, Format und Tests.

## 12. Lieferreihenfolge

### Phase A: praesentierbare vertikale Scheibe – weitgehend umgesetzt

- Template auf WebApp und benoetigte Infrastruktur reduzieren
- `Calm Logistics` Design-Tokens und App-Shell
- Demo-Tenant mit realistischer Preisprofilversion
- kompletter Kundenflow mit strukturiertem Inventar
- Kontakt-Gate, Autosave und unverbindliche Ergebnisansicht
- echte deterministische Preisengine
- typisierte Tenant-Einstellungen fuer alle aktuell preiswirksamen Parameter und Leistungen
- Chat-Split-View mit mindestens `addService`, `removeService` und `explainPrice`
- Bestaetigungsanfrage
- Firmenliste, Preisversions-/Revisionssicht und Bestaetigen

Ziel ist eine glaubwuerdige End-to-End-Demo fuer die Gespraeche, nicht eine Sammlung unverbundener Screens.

### Phase B: Pilotfaehigkeit

- Tenant-Onboarding und Mitgliederverwaltung
- Branding-, Depot- und Gebietsverwaltung sowie Versionsvergleich im bereits aktiven Preiskonfigurator
- produktive Google-Key-, Quota-, Datenschutz- und Fehlerkonfiguration fuer den vorhandenen Adress-/Routenadapter
- produktive Medienuploads und AI-Inventarvorschlag
- E-Mail, PDF und Benachrichtigungen
- Datenschutz-, Sicherheits- und Missbrauchsschutz
- Kalibrierung mit historischen Offerten

### Phase C: Produktionsreife und Optimierung

- Integrationen und Webhooks
- Termin-/Kapazitaetsabgleich
- Funnelanalytics und automatische Follow-ups
- Vergleich kalkuliert/bestaetigt/effektiv
- Last-, Kosten- und Provider-Fallback-Tests
- White-Label-Domains und Embed-Haertung

## 13. Naechster Implementierungsschritt

Die vertikale Demo-Scheibe ist durchspielbar und definiert die echten Domainvertraege. Als naechstes wird nicht mehr UI-Breite aufgebaut, sondern der vorhandene Flow fuer echte Pilotdaten gehaertet: Portal-Authentisierung, Magic Link/E-Mail, PDF, private Medienjobs und Missbrauchsschutz.

Vor der Implementation werden aus den drei Pilotunternehmen folgende Artefakte benoetigt, soweit vorhanden:

- ein aktuelles Offertbeispiel
- Preislisten oder interne Kalkulationsnotizen
- zehn bis dreissig historische Standardumzuege mit effektivem Aufwand
- typische Ausschluss- und Mehraufwandfaelle
- Logo, Farben und ein Beispiel fuer die gewuenschte Kundenansprache

## 14. Zielstruktur im Repository

```text
apps/web/src/
  app/
    (quote)/[locale]/                 oeffentlicher Rechner
    (portal)/[locale]/portal/         Unternehmensportal
    (payload)/                        Plattform-Admin und Payload API
    api/auth/                          Better Auth
    api/v1/                            typisierte oRPC-Endpunkte
  features/
    tenants/
    quoteFlow/
    quotes/
    pricing/
    inventory/
    mediaAnalysis/
    conversations/
    notifications/
  lib/
    ai/                                Provideradapter, keine Domainlogik
    auth/
    email/
    maps/
    payload/
    storage/
    tx/
packages/
  api/                                 geteilte oRPC-Vertraege
  shared/                              kleine frameworkfreie Hilfen
docs/
  01-product-concept.md
  02-spec.md
  03-technical-plan.md
```

Feature-Verzeichnisse enthalten jeweils nur die benoetigten Unterordner wie `business`, `collections`, `components`, `model` und `server`. Datenzugriff bleibt im Business Layer. React-Komponenten rufen Payload nie direkt auf.

## 15. API- und Transaktionsgrenzen

### Public Quote API

- Tenant anhand Host oder Slug serverseitig aufloesen
- Draft erstellen/aktualisieren
- Adressen validieren und Route berechnen
- Upload-Session und signierte Uploads verwalten
- Klassifikationsjob starten und Status lesen
- Kontakt-Gate atomar abschliessen
- Offertrevision berechnen und speichern
- Magic-Link pruefen
- Bestaetigung anfordern

### Tenant Portal API

- aktuelle Membership aus Session ermitteln
- Leads und Offerten ausschliesslich im aktiven Tenant laden
- Offertrevision bestaetigen oder ersetzen
- Preisprofil als Entwurf bearbeiten und explizit veroeffentlichen
- Funnelereignisse aggregiert lesen

### Atomare Operationen

Mindestens diese Aktionen laufen in einer Datenbanktransaktion:

- Kontakt speichern + Quote anlegen + erste Revision erzeugen
- preisrelevante Aenderung + neue Revision + Statusanpassung
- Firmenbestaetigung + AuditEvent + Benachrichtigungsauftrag
- Tenant-Einladung + Membership-Anlage

E-Mail, AI-Analyse und PDF-Rendering laufen ausserhalb der DB-Transaktion als idempotente Jobs. Die Transaktion schreibt dafuer einen Outbox-Eintrag.

## 16. Preisengine-Vertrag

Die Domainfunktion erhaelt nur serialisierbare, validierte Werte:

```ts
type CalculateQuoteInput = {
  pricingVersion: PricingProfileSnapshot
  move: ConfirmedMoveInput
  route: RouteSnapshot
}

type QuoteCalculation = {
  subtotalRappen: number
  vatRappen: number
  totalRappen: number
  estimatedMinutes: number
  requiredWorkers: number
  requiredVehicles: number
  components: PriceComponent[]
  assumptions: QuoteAssumption[]
}
```

Erste Preisbausteine:

1. Mindestpreis
2. geschaetzte Arbeitszeit aus Volumen, Handling und Zugang
3. Teamkosten pro Stunde
4. Fahrzeug- oder Volumenkosten
5. Anfahrt, Strecke und Rueckfahrt
6. zusaetzliche Leistungen
7. Termin-, Saison- und Spezialzuschlaege
8. Rabatte
9. MWST
10. tenant-spezifische Rundung

Jede Komponente besitzt eine stabile ID, internen Titel, optionalen Kundentitel, Betrag und Berechnungsgrund. Dadurch kann der Chat Preise erklaeren, ohne sie neu zu erfinden.

## 17. Tenant-Konfiguration ohne Low-Code-Falle

Der erste Konfigurator bietet klar typisierte Parameter statt beliebiger Formeln:

- Depot und Regeln fuer An-/Rueckfahrt
- Mindestpreis
- Teamgroessen und Stundenansaetze
- Fahrzeuge, Kapazitaet und Kosten
- Produktivitaet pro Kubikmeter
- Zugangs- und Tragewegfaktoren
- Wochenend-, Saison- und Kurzfristzuschlaege
- Leistungskatalog mit Fix-, Mengen- oder Zeittarif
- Spezialgegenstaende
- MWST und Rundung
- Kundendarstellung und Pflichtfelder

Ein Tenant bearbeitet immer einen Entwurf. `Veroeffentlichen` erzeugt eine unveraenderliche Version. Vor dem Veroeffentlichen zeigt ein Simulator mindestens drei Beispielumzuege und den Preisunterschied zur bisherigen Version.

## 18. Datenschutz und Sicherheit

- Medien und Offerten sind standardmaessig privat; kein oeffentlicher Payload-Read.
- Objekt-Storage-Keys enthalten Tenant- und Quote-Scope, aber keine Kundennamen.
- Signierte Download-URLs sind kurzlebig.
- EXIF-Metadaten werden fuer Analysezwecke minimiert; Originale werden nicht in AI-Prompts eingebettet, wenn ein kurzlebiger Provider-Upload genuegt.
- AI-Aufrufe und Logs enthalten nur die fuer die Aufgabe erforderlichen Daten.
- Sentry Session Replay ist im Kundenflow standardmaessig deaktiviert; Formulare, PII und Medien werden nicht aufgezeichnet.
- Magic Links werden gehasht, laufen ab, sind widerrufbar und rate-limitiert.
- Jeder Tenantzugriff besitzt positive und negative Isolationstests.
- Aufbewahrung und Loeschung sind nach Status und Tenant konfigurierbar.
- Google-Datenverarbeitung, Region und Aufbewahrung werden vor dem produktiven Pilot vertraglich geprueft; falls erforderlich wird der Adapter auf Vertex AI mit ADC/Workload Identity umgestellt.

## 19. Observability und Produktmetriken

Technische Telemetrie:

- strukturierte Request- und Joblogs mit `tenantId`, `quoteId` und Correlation-ID
- Sentry fuer unerwartete Fehler ohne Kundeninhalte
- AI-Latenz, Usage, Modell-ID, Promptversion und Fehlerart
- Maps-, E-Mail-, Storage- und PDF-Providerfehler
- keine Tokens, vollstaendigen Prompts, Medien oder Magic Links in Logs

Funnelereignisse:

- `quote_started`
- `step_completed`
- `contact_captured`
- `quote_calculated`
- `quote_viewed`
- `confirmation_requested`
- `company_confirmed`
- `company_changed`
- `customer_accepted`
- `quote_booked`

Ereignisse sind serverseitig dedupliziert. Dashboardzahlen werden aus fachlichen Events abgeleitet, nicht aus reinem Browsertracking.

## 20. Detaillierter Lieferplan

### Slice 0: Repository-Fundament

- Mobile-App, Push-Infrastruktur, Marketing-CMS und Sitemap/Preview entfernen
- Projekt und Workspacepakete auf `zuegelofferte` umbenennen
- lokale PostgreSQL-Version auf CI-Version fixieren
- minimale lokalisierte WebApp-Shell und Health-Vertrag bereitstellen
- Payload/Better Auth, DI, Transaktionen, E-Mail, Sentry und Testaufteilung behalten
- Vercel AI SDK und Gemini-Provider serverseitig kapseln
- generierte Payload-Artefakte und Basismigration neu erzeugen
- alle Qualitaetsgates gruen ausfuehren

Abnahme: frischer Checkout kann installiert, gestartet, typgeprueft und getestet werden, ohne Mobile- oder Marketingabhaengigkeiten zu laden.

### Slice 1: Reine Domain und Demo-Tenant

- Money-, Route-, Access-, Inventory- und Quote-Typen
- versionierte Preisprofilstruktur
- Preisengine mit nachvollziehbaren Komponenten
- Quote-Statusmaschine und Revisionserzeugung
- realistischer Demo-Tenant und Golden Pricing Cases

Abnahme: mindestens zehn typische Umzuege werden reproduzierbar in Rappen berechnet und jede Preiszeile ist erklaerbar.

### Slice 2: Schnellster vollstaendiger Kundenflow – umgesetzt

- Tenant-Aufloesung
- Adressen, Datum und Zugang
- manuelle Schnellinventar-Erfassung
- Leistungen, Zusammenfassung und Vollstaendigkeitsbestaetigung
- versioniertes Local-Storage-Autosave
- Kontakt-Gate und serverseitige Quote
- Ergebnisansicht mit unverbindlichem Status

Abnahme: der Demo-Flow ist auf Mobile und Desktop in unter fuenf Minuten abschliessbar; Reload verliert keine Eingaben und vor dem Kontakt-Gate erscheint kein Preis.

### Slice 3: Firmenpruefung – POC-Kern umgesetzt

- Membership und Tenantrollen
- priorisierte Leadliste
- Offertdetail und Revisionsdiff
- Bestaetigen, Preis/Leistung anpassen und Kundenbenachrichtigung
- Kundenansicht der bestaetigten Revision

Abnahme: eine Standardofferte kann in weniger als einer Minute geprueft und bestaetigt werden; zwei Tenant-Testdaten sind strikt isoliert.

Offen in diesem Slice: produktive Session-/Membership-Autorisierung, Firmen-Preisaenderung, Kundenbenachrichtigung und vollstaendige Zwei-Tenant-Isolation im Portal. Das Datenmodell fuer Membership und Tenant-Scope ist bereits vorhanden.

### Slice 4: Chat mit sicheren Werkzeugen

- Split-View-Chat
- gestreamte Antworten mit Gemini 3.7 Flash
- Lese- und Mutationswerkzeuge
- Vorschau, Preisdelta, Revision und Undo
- Handoff an Unternehmen

Abnahme: kein Prompt kann den Preis direkt setzen, tenantfremde Daten lesen oder eine Firmenbestaetigung simulieren.

### Slice 5: Mediengestuetztes Inventar

- private Upload-Session und Storage
- asynchroner Analysejob
- Gemini-Schemaextraktion
- Katalognormalisierung, Confidence und Coverage
- kundenfreundliche Bestaetigungsansicht
- Golden-Dataset-Evaluation

Abnahme: die AI reduziert die mediane Inventarerfassungszeit gegenueber der manuellen Variante und unterschreitet die mit den Piloten vereinbarte Volumenabweichung.

### Slice 6: Pilot-Haertung

- vollstaendige Tenant-Konfiguration und Versionsvergleich
- E-Mail-Templates, PDF, Reminder und Outbox
- Rate Limits, Retention, Consent und Loeschung
- Funnel-Dashboard und Kalibrierungsansicht
- Embed/Subdomain, White Label und Betriebshandbuch
- Last-, Kosten-, Browser- und Wiederherstellungstests

Abnahme: jeder Pilot hat ein abgenommenes Preisprofil, Datenschutzentscheidungen, Monitoring und eine getestete Wiederherstellung.

## 21. Definition of Done pro Slice

- fachliche Akzeptanzkriterien sind im Living Spec aktualisiert
- keine Domainlogik in React-Komponenten oder Provideradaptern
- Eingaben sind an jeder externen Grenze mit Zod validiert
- Tenant- und Berechtigungspruefungen liegen serverseitig
- relevante Unit-, DOM- und DB-Tests sind vorhanden
- Typecheck, Lint, Format und Tests laufen gruen
- generierte Payload-Typen, Schema und Migrationen sind aktuell
- PII, Logging und Fehlermeldungen wurden geprueft
- sichtbarer Flow wurde responsiv und tastaturbedienbar geprueft
- keine nicht belegte Genauigkeits-, Zeit- oder Preisbehauptung in Demo oder Dokumentation

## 22. Lokaler Entwicklungsstart

Voraussetzungen:

- Node.js aus `.nvmrc`
- pnpm aus `packageManager`
- Docker fuer PostgreSQL und Mailpit
- optional `AI_GATEWAY_API_KEY` fuer echte lokale AI-Aufrufe; Vercel-Deployments verwenden OIDC
- optional `GOOGLE_MAPS_SERVER_API_KEY` fuer Places (New), Place Details und Routes
- optional `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY` fuer die eingebettete Routenvorschau

Standardablauf:

```bash
docker compose up -d
pnpm install
pnpm dev
```

Qualitaetsgates:

```bash
pnpm check:types
pnpm lint
pnpm format
pnpm test
```

Ohne Google-Keys startet die Anwendung weiterhin. AI-Funktionen melden kontrolliert `nicht konfiguriert`; Maps wechselt sichtbar auf manuelle Adressen und Distanz. Deterministischer Frageflow und Preisengine bleiben test- und entwickelbar.

## 23. Offene Entscheidungen vor dem produktiven Pilot

- Gemini Developer API oder Vertex AI fuer produktive Schweizer Kundendaten
- gewuenschte Datenregion, Aufbewahrung und Loeschfristen
- Festpreis, Preisspanne oder beide Darstellungen pro Tenant
- Pflicht zur Telefonnummer vor Preisansicht
- minimale Medienabdeckung fuer einen belastbaren Inventarvorschlag
- Umgang mit Faellen, die das Unternehmen nur nach Besichtigung bestaetigt
- juristische Bedeutung von Firmenbestaetigung und Kundenannahme
- Google Maps fuer den Pilot beibehalten oder nach Datenschutz-/Kostenpruefung einen weiteren Provideradapter ergaenzen
- PDF-Signatur und spaetere verbindliche Buchung

Diese Punkte blockieren den Demo-Flow nicht. Sie sind explizite Pilotentscheidungen und duerfen nicht stillschweigend im Code festgeschrieben werden.
