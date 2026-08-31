# Zuegelofferte – Living Product Spec

Status: Entwurf fuer die erste durchspielbare Version  
Stand: 30. August 2026

Dieses Dokument ist die zentrale fachliche Spezifikation. Entscheidungen und Akzeptanzkriterien werden hier nach den Gespraechen mit den Pilotunternehmen weitergefuehrt.

## 1. Rollen

- `visitor`: anonymer Besucher im Rechner
- `customer`: Lead mit sicherem Zugriffslink auf die eigene Offerte
- `tenantMember`: Mitarbeiter eines Zuegelunternehmens
- `tenantAdmin`: verwaltet Firma, Mitglieder und Kalkulationsparameter
- `platformAdmin`: betreut Tenants und Plattformbetrieb

## 2. Oeffentlicher Kundenflow

Der Rechner laeuft als fokussierte WebApp ohne Marketing-Navigation. Er wird ueber Tenant-Slug, eigene Domain oder Embed eindeutig einem Tenant zugeordnet.

### Schritt 1: Umzug

- Startadresse mit Autocomplete und Adressbestaetigung
- Zieladresse mit Autocomplete und Adressbestaetigung
- optional weitere Stopps
- Wunschtermin oder Zeitraum
- Privat-, Haus- oder Geschaeftsumzug
- Route und Distanz werden im Hintergrund berechnet

Die Route umfasst je nach Tenant-Konfiguration auch Depot, Rueckfahrt und weitere Stopps.

Der Maps-Provider ist nur Erfassungs- und Routendienst. Die Anwendung speichert den kanonischen Adresssnapshot, Place-ID, Distanz, Fahrzeit und Providerherkunft in der Offertrevision. Ist der Provider nicht konfiguriert oder nicht erreichbar, bleibt ein sichtbar als manuell bezeichneter Fallback verfuegbar; eine manuelle Distanz darf nie als Google-bestaetigt erscheinen.

### Schritt 2: Zugang

Jeweils fuer Start und Ziel:

- Etage
- Lift vorhanden
- Lift ungefaehr fuer Umzug nutzbar
- Laufweg Fahrzeug bis Eingang
- enge oder besondere Zugangssituation
- Halteverbotszone oder Moebellift

Nur aktive, preis- oder ausfuehrungsrelevante Fragen des Tenants werden angezeigt.

### Schritt 3: Inventar

Erfassungswege:

1. gefuehrte Foto- oder Videoaufnahme
2. raumweise manuelle Inventarliste
3. vereinfachte Schnellangabe fuer den Demo- und Fallbackfall

Bei Medienerfassung:

- Kunde wird Raum fuer Raum gefuehrt.
- AI erstellt eine strukturierte Gegenstandsliste.
- Gegenstaende werden einem Volumen- und Handhabungskatalog zugeordnet.
- Unsichere Erkennungen werden sichtbar markiert.
- Kunde bestaetigt Mengen und ergaenzt verdeckte Inhalte, Kartons, Keller, Estrich, Garage und Balkon.
- Spezialgegenstaende wie Klavier, Tresor, Aquarium oder Antiquitaeten werden separat erfasst.

Die erste Demo darf mit einer deterministischen Beispielerkennung arbeiten. Sie darf diese nicht als produktiv gemessene Genauigkeit darstellen.

### Schritt 4: Leistungen

Tenant-abhaengige Auswahl, zum Beispiel:

- Einpacken und Auspacken
- Demontage und Montage
- Kartons und Verpackungsmaterial
- Entsorgung
- Reinigung
- Einlagerung
- Spezialtransport

Die Auswahl zeigt kurze, konkrete Erklaerungen. Noch kein Preis wird angezeigt.

### Schritt 5: Zusammenfassung

- Route, Datum, Zugaenge, Inventar und Leistungen kompakt anzeigen
- einzelne Bereiche direkt bearbeitbar
- Vollstaendigkeit aktiv durch den Kunden bestaetigen lassen
- noch keine Preisangabe oder verratende Preisbestandteile anzeigen

### Schritt 6: Kontakt-Gate

Vor der Preisansicht:

- Vor- und Nachname
- E-Mail, immer erforderlich
- Telefonnummer, durch Tenant optional oder erforderlich konfigurierbar
- Zustimmung zur Kontaktaufnahme und Verweis auf Datenschutz

Nach erfolgreicher Speicherung:

- Lead und erste Offertrevision serverseitig anlegen
- sicheren Fortsetzungslink per E-Mail senden
- Preis direkt anzeigen; kein Warten auf die E-Mail

### Schritt 7: Unverbindliche Offerte

Die Ergebnisansicht zeigt:

- klar hervorgehobenen Gesamtpreis oder eine tenant-konfigurierte Preisdarstellung
- Status `Automatisch berechnet – noch nicht durch das Unternehmen bestaetigt`
- enthaltene Leistungen
- Umzugsvolumen, Team, Fahrzeug und voraussichtliche Dauer, soweit vom Tenant freigegeben
- relevante Annahmen und Ausschluesse
- PDF/Download der aktuellen unverbindlichen Offertrevision
- Button `Preis bestaetigen lassen`
- Chat-Einstieg fuer Fragen und Aenderungen

Der Preis bleibt immer sichtbar, sobald das Kontakt-Gate erfolgreich abgeschlossen ist.

## 3. Autosave und Fortsetzen

### Vor dem Kontakt-Gate

- Eingaben nach jeder Aenderung lokal und tenant-spezifisch speichern
- beim erneuten Oeffnen auf demselben Geraet Fortsetzung anbieten
- Schema-Version mitspeichern und ungueltige alte Daten sicher verwerfen
- Medienuploads ueber eine kurzlebige, anonyme Upload-Session zuordnen

### Nach dem Kontakt-Gate

- Eingaben und Offertrevision serverseitig speichern
- Fortsetzung auf jedem Geraet ueber einen sicheren Magic Link
- keine normale Kundenregistrierung und kein Passwort verlangen
- Token nur gehasht speichern und widerrufbar machen

Ein Kunde kann den Entwurf bewusst loeschen. Aufbewahrungszeiten sind tenant- und datenschutzkonform konfigurierbar.

## 4. Offertstatus

```text
draft
  -> calculated
  -> confirmationRequested
  -> companyConfirmed | companyChanged
  -> customerAccepted | customerDeclined | expired
  -> booked
```

| Status                  | Bedeutung                                        | Benachrichtigung                             |
| ----------------------- | ------------------------------------------------ | -------------------------------------------- |
| `draft`                 | Erfassung noch nicht abgeschlossen               | keine                                        |
| `calculated`            | Lead gespeichert, unverbindlicher Preis sichtbar | optional nur Dashboard                       |
| `confirmationRequested` | Kunde moechte den Preis bestaetigen lassen       | Firma sofort benachrichtigen                 |
| `companyConfirmed`      | Firma bestaetigt Preis und Inhalt unveraendert   | Kunde benachrichtigen                        |
| `companyChanged`        | Firma hat Preis oder Leistung angepasst          | Kunde benachrichtigen und Aenderungen zeigen |
| `customerAccepted`      | Kunde nimmt die bestaetigte Offerte an           | Firma sofort benachrichtigen                 |
| `customerDeclined`      | Kunde lehnt ab                                   | Dashboard aktualisieren                      |
| `expired`               | Offerte nicht mehr gueltig                       | optional erinnern                            |
| `booked`                | Auftrag wurde verbindlich eingeplant             | Abschluss                                    |

Eine Aenderung an preisrelevanten Daten erzeugt eine neue Revision. Nach einer Firmenbestaetigung setzt eine Kunden- oder Chat-Aenderung den Status wieder auf `calculated`.

## 5. Chat auf der Offertseite

### Darstellung

- geschlossen als kompakter, gut sichtbarer Einstieg am rechten Rand
- auf Desktop als rechte Seitenflaeche; die Offerte wird weich verkleinert und nach links verschoben
- nicht als schwebendes Fenster ueber wichtigen Offertdaten
- auf Mobile als Vollbild- oder Bottom-Sheet-Ansicht
- Preis und Revisionsstatus bleiben auch bei offenem Chat sichtbar

### Verhalten

Der Chat beantwortet Fragen zur konkreten Offerte und darf ausschliesslich validierte Werkzeuge verwenden:

- `explainPrice`
- `addService`
- `removeService`
- `changeMoveDate`
- `updateAccess`
- `addInventoryItem`
- `removeInventoryItem`
- `requestCompanyConfirmation`
- `handoffToCompany`

Werkzeugaufrufe veraendern strukturierte Daten. Danach rechnet die deterministische Preisengine neu. Das Sprachmodell darf nie selbst einen Preis setzen oder eine Firmenbestaetigung vortaeuschen.

Jede Aenderung zeigt:

- was geaendert wurde
- wie sich der Preis geaendert hat
- neue Revisionsnummer
- Rueckgaengig-Aktion

Der Tenant-Mitarbeiter sieht den relevanten Chatverlauf bei der Pruefung.

## 6. Unternehmensportal

### Dashboard

- Funnelzahlen von gestarteten Berechnungen bis gewonnenen Auftraegen
- Anzahl und Wert neuer Leads
- separate, priorisierte Liste `Bestaetigung angefragt`
- Umzugsdatum, Strecke, Preis, Volumen und letzter Status
- Filter nach Status, Datum, Region und Mitarbeiter

### Offertdetail

- Kundendaten und Kontaktaktionen
- strukturierte Umzugsdaten
- Medien und bestaetigte Inventarliste
- interne Kalkulationsaufschluesselung
- bisherige Revisionen und Aenderungsdiff
- Chatverlauf
- Aktionen `Bestaetigen`, `Preis/Leistung anpassen`, `Rueckfrage senden`, `Ablehnen`

Eine Bestaetigung soll im Standardfall weniger als eine Minute benoetigen.

### Tenant-Einstellungen

- Firmenprofil, Logo, Farben, Sprache und Domain
- Depot und bediente Gebiete
- Teams, Fahrzeuge und Kapazitaeten
- Mindestpreise und Rundungsregeln
- Zeit-, Distanz- und Volumenansaetze
- Zugangs-, Termin- und Saisonfaktoren
- Leistungen und Spezialgegenstaende
- MWST, Rabatte und Zuschlaege
- erforderliche Kundenfelder
- Offerttexte, Gueltigkeit und Rechtstexte
- Benachrichtigungen und Integrationen

Preiskonfigurationen haben Entwurf und veroeffentlichte Version. Bestehende Offerten behalten immer ihren Kalkulationssnapshot.

Der erste aktive Konfigurator umfasst Mindestpreis, Team- und Fahrzeugansaetze, Distanz und Depot, produktive Minuten je Kubikmeter, Fahrzeitmodell, Abrechnungsintervall, Team- und Fahrzeugstaffelung, Stockwerk/Lift/Trageweg, Termin/Saison, Spezialobjekte, MWST, Rundung und tenant-spezifische Zusatzleistungen. Aenderungen wirken erst nach explizitem Veroeffentlichen auf neue Revisionen.

## 7. Designrichtung

Arbeitstitel: `Calm Logistics`.

- warme, helle Grundflaeche statt typischem SaaS-Grau
- dunkles Petrol oder Ink als verlaessliche Basisfarbe
- Tenant-Akzentfarbe fuer Buttons, Fortschritt und Status
- grosse Typografie, viel Weissraum und ruhige Karten
- dezente Routenlinie als wiederkehrendes visuelles Motiv
- keine AI-Glows, Roboter-Illustrationen oder verspielte Logistik-Cliparts
- Bewegung nur fuer Fortschritt, Preisupdates und das Oeffnen des Chats
- kontrastreich, tastaturbedienbar und mit reduzierter Bewegung nutzbar

Die erste Designfreigabe soll anhand eines echten, responsiven Kundenflows erfolgen, nicht anhand einer isolierten Landingpage.

## 8. Demo-Akzeptanzkriterien

Die erste praesentierbare vertikale Scheibe muss:

- einen gebrandeten Demo-Tenant laden
- den kompletten Kundenflow mobil und auf Desktop durchspielbar machen
- Eingaben bei Reload fortsetzen
- den Preis erst nach Kontaktangaben zeigen
- einen nachvollziehbaren, deterministisch berechneten Preis anzeigen
- die unverbindliche Natur klar kommunizieren
- Leistungen auf der Ergebnisansicht hinzufuegen oder entfernen koennen
- den Chat als einschiebende Seitenflaeche demonstrieren
- `Preis bestaetigen lassen` ausloesen
- die Anfrage im Unternehmensportal priorisiert anzeigen
- eine responsive Tenant-Konfiguration fuer alle aktuell preiswirksamen Parameter und Leistungen zeigen
- Entwurf und veroeffentlichte Preisversion sichtbar trennen
- eine Bestaetigung oder Preisaenderung durch die Firma demonstrieren
- den aktualisierten Status aus Kundensicht anzeigen

Tenant-Selbstregistrierung, produktive Medien-AI und vollstaendige PDF-Erzeugung duerfen nach dem Verkaufsgespraech fertiggestellt werden, sofern ihre Zielarchitektur nicht verbaut wird.

## 9. Fragen fuer die Pilotgespraeche

- Welche Kontaktdaten muessen vor dem Preis zwingend vorhanden sein?
- Welche Preisbestandteile duerfen Kunden sehen?
- Welche Faelle werden heute nie ohne Besichtigung offeriert?
- Wie lange ist eine bestaetigte Offerte gueltig?
- Ist die Firmenbestaetigung bereits ein verbindliches Angebot oder erst die Grundlage fuer die Kundenannahme?
- Welche historischen Daten existieren: Offerte, effektive Stunden, Fahrzeuge, Team und Schlussrechnung?
- Welche Benachrichtigungskanaele werden im Alltag wirklich beachtet?
