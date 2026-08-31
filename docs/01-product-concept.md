# Zuegelofferte – Produktkonzept

Status: Arbeitsgrundlage fuer den ersten Demo- und Pilotumfang  
Stand: 30. August 2026

## Produktentscheidung

Zuegelofferte ist kein Marktplatz und kein Leadverteiler. Die Anwendung gehoert im Auftritt zum jeweiligen Zuegelunternehmen und wird als Link, Subdomain oder eingebetteter Rechner auf dessen Website verwendet.

Das Produktversprechen:

> Besucher erhalten in wenigen Minuten eine persoenliche, unverbindliche Umzugsofferte. Das Zuegelunternehmen bearbeitet erst jene Anfragen aktiv, bei denen der Kunde den Preis bestaetigen lassen moechte.

Damit loest das Produkt zwei Probleme gleichzeitig:

- Kunden erhalten sofort eine brauchbare Preisorientierung statt eines Rueckrufversprechens.
- Zuegelunternehmen erhalten strukturierte, vorqualifizierte Anfragen statt unvollstaendiger Kontaktformulare.

## Kernablauf

```text
Tenant-Link oder Widget
  -> Umzugsdaten erfassen
  -> Kontaktdaten eingeben
  -> unverbindliche Offerte mit Preis erhalten
  -> Offerte anpassen oder Fragen im Chat klaeren
  -> "Preis bestaetigen lassen" anklicken
  -> Zuegelunternehmen prueft und bestaetigt oder korrigiert
  -> Kunde nimmt die bestaetigte Offerte an
```

## Bewusste Produktregeln

1. Jeder vollstaendig erfasste, berechenbare Umzug erhaelt einen Preis.
2. Der automatisch berechnete Preis ist klar als unverbindlich gekennzeichnet.
3. Vor der Preisansicht werden mindestens E-Mail und die vom Tenant verlangten Kontaktdaten erfasst.
4. Alle abgeschlossenen Berechnungen erscheinen als Leads im Unternehmensportal.
5. Eine aktive Benachrichtigung und Bearbeitungsaufgabe entsteht erst, wenn der Kunde die Bestaetigung anfordert.
6. Nur das Zuegelunternehmen kann aus dem berechneten Preis eine bestaetigte Offerte machen.
7. Aendert sich eine relevante Angabe, entsteht eine neue Offertrevision; eine fruehere Bestaetigung gilt nicht stillschweigend weiter.

## Lead-Funnel

Die Anwendung soll dem Unternehmen nicht nur einzelne Offerten, sondern den sichtbaren Wert des Rechners zeigen.

| Stufe                  | Bedeutung                               |
| ---------------------- | --------------------------------------- |
| Gestartet              | Rechner wurde begonnen                  |
| Lead erfasst           | Kontaktdaten wurden gespeichert         |
| Preis angesehen        | Unverbindliche Offerte wurde angezeigt  |
| Bestaetigung angefragt | Kunde signalisiert konkrete Kaufabsicht |
| Durch Firma bestaetigt | Preis wurde geprueft oder angepasst     |
| Vom Kunden angenommen  | Kunde nimmt die bestaetigte Offerte an  |
| Gewonnen               | Auftrag wurde verbindlich gebucht       |

Das Unternehmen darf alle Leads sehen. Der operative Fokus liegt aber auf `Bestaetigung angefragt`.

## Zielgruppen

### Umzugskunde

- moechte schnell wissen, was der Umzug ungefaehr kostet
- moechte keinen Besichtigungstermin nur fuer eine erste Preisangabe
- moechte Angaben spaeter korrigieren und Fragen stellen koennen
- erwartet eine einfache, mobil optimierte Bedienung

### Zuegelunternehmen

- moechte die eigene Preislogik abbilden
- moechte weniger Zeit fuer unqualifizierte Anfragen aufwenden
- moechte vollstaendige Umzugsdaten, Fotos und Videos an einem Ort sehen
- moechte eine vorbereitete Offerte nur noch bestaetigen oder korrigieren
- moechte messen koennen, wie viele Leads und Auftraege der Rechner erzeugt

## Differenzierung

- White-Label-Auftritt des jeweiligen Zuegelunternehmens
- keine Konkurrenzofferten und keine Weitergabe an einen Marktplatz
- Leads und Kundendaten bleiben beim Tenant
- tenant-spezifische, nachvollziehbare Preislogik
- strukturierte Datenerfassung inklusive Medien statt unstrukturiertem Freitext
- Kundenchat direkt im Kontext der Offerte
- Werkzeugaktionen im Chat koennen Leistungen und Angaben kontrolliert veraendern
- menschliche Preisfreigabe erst bei konkretem Kundeninteresse

Die AI ist nicht der Preisentscheider. Sie hilft bei Inventarerfassung, Erklaerungen und Aenderungen. Der Preis stammt aus einer versionierten, deterministischen Kalkulation.

## Erfolgskriterien fuer einen Pilot

- Median der vollstaendigen Kundenerfassung unter fuenf Minuten
- hohe Quote von begonnenen zu preisangezeigten Berechnungen
- messbarer Anteil der Preisansichten mit anschliessender Bestaetigungsanfrage
- deutlich weniger manuelle Bearbeitungszeit pro qualifiziertem Lead
- nachvollziehbare Abweichung zwischen berechnetem, bestaetigtem und effektivem Preis
- keine tenant-uebergreifende Datenfreigabe

Konkrete Zielwerte werden mit den drei Pilotunternehmen anhand ihrer heutigen Zahlen festgelegt.

## Nicht Ziel der ersten Version

- kein schweizweiter Marktplatz
- keine automatische Auftragsverteilung an Drittunternehmen
- keine vollstaendige Dispositions- oder Flottensoftware
- keine beliebig programmierbare Low-Code-Regelplattform
- keine verbindliche Fixpreisgarantie durch die Plattform
- keine native Mobile-App fuer Endkunden
