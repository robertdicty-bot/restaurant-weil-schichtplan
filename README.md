# Restaurant Weil – Schichtplan

## Enthalten
- Alle 7 Tage gleichzeitig
- Küche / Service optisch getrennt
- Pal in der Küche
- Auswahl: Schicht / Frei / Urlaub / Krank
- Automatische Wochenübersicht (Schichten, Stunden, Frei, Urlaub, Krank)
- Druckansicht
- Gemeinsame Speicherung über Supabase + Vercel Function

## Gemeinsame Datenbank einrichten
1. Supabase-Projekt anlegen.
2. `supabase.sql` im Supabase SQL Editor ausführen.
3. In Vercel → Project → Settings → Environment Variables:
   `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` anlegen.
4. Neu deployen.
5. `index.html` UND den Ordner `api/` ins GitHub-Repository hochladen.

Wichtig: Den Service-Role-Key niemals in `index.html` eintragen. Er bleibt ausschließlich als Vercel Environment Variable auf dem Server.
