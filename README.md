# MentorMatch (Express + jQuery + Bootstrap)

Piattaforma per mentoring 1:1 con:
- Catalogo mentor con filtri
- Registrazione/Login (Mentor/Mentee)
- Gestione slot disponibilità (mentor)
- Prenotazioni (mentee) + dashboard
- Recensioni (rating 1–5) + media
- Notifiche email (se SMTP configurato) oppure log in console
- Deploy cloud consigliato: Render

## Requisiti
- Node.js 18+
- PostgreSQL 14+

## Setup rapido (locale)
1) Clona la repo e installa:
```bash
npm install
cp .env.example .env
```

2) Avvia Postgres (opzione Docker):
```bash
docker compose up -d
```

3) Crea schema e seed:
```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

4) Avvia:
```bash
npm run dev
```
Apri: http://localhost:3000

## Utenti di esempio
- Mentor: mario@example.it / MarioRossi25.
- Mentee: mentee@example.it / Mentee25.

## Struttura
- `server/` backend Express + API REST
- `public/` frontend statico (Bootstrap + jQuery)
- `db/` schema e seed

## Test
```bash
npm test
```
