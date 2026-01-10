# MentorMatch (Express + jQuery + Bootstrap)

Piattaforma per mentoring 1:1 con:
- Catalogo mentor con filtri (settore, lingua, rating, disponibilità)
- Registrazione/Login (Mentor/Mentee)
- Gestione slot disponibilità (mentor)
- Prenotazioni (mentee) + dashboard
- Recensioni (rating 1–5) + media
- Notifiche email (se SMTP configurato) oppure log in console
- Deploy cloud consigliato: Render

> Vincoli progetto rispettati: nessun framework Frontend/Backend (solo jQuery + Bootstrap + Express).

> Video DEMO : https://drive.google.com/file/d/1QAmamMNj176eoelLyABunuGtjEUY8GUL/view?usp=sharing
---

## Requisiti
- Node.js 18+
- PostgreSQL 14+ (qualsiasi versione recente va bene)

---

## Setup rapido (locale)

### 1) Installa dipendenze
```bash
npm install
```

### 2) Crea il file `.env`
**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**Windows CMD**
```cmd
copy .env.example .env
```

**Linux/Mac**
```bash
cp .env.example .env
```

Apri `.env` e imposta almeno:
```env
DATABASE_URL=postgres://postgres:LA_TUA_PASSWORD@localhost:5432/mentormatch
SESSION_SECRET=super-secret-change-me
```

> Nota: `.env` NON deve finire su Git (è ignorato da `.gitignore`).

---

## Avvio PostgreSQL

### Opzione A (consigliata): con Docker
```bash
docker compose up -d
```

### Opzione B: senza Docker (Windows)
1) Installa PostgreSQL (anche con PGADMIN)
2) Crea un DB chiamato **mentormatch**
   - con pgAdmin: Databases → Create → Database…
   - oppure via SQL: `CREATE DATABASE mentormatch;`

---

## 3) Crea schema e dati demo

### Metodo generico (se `psql` è nel PATH)
```bash
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
```

### Windows (se `psql` NON è nel PATH)
Sostituisci il percorso con la tua versione di PostgreSQL (esempio):
```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgres://postgres:LA_TUA_PASSWORD@localhost:5432/mentormatch" -f db\schema.sql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgres://postgres:LA_TUA_PASSWORD@localhost:5432/mentormatch" -f db\seed.sql
```

### Se usi PGADMIN
1) Lancia la query in schema.sql
2) Lancia la queri in seed.sql

---

## 4) Avvia l’app
```bash
npm run dev
```

Apri: http://localhost:3000

---

## Utenti di esempio (dopo seed)
- Mentor: `mario@example.it` / `MarioRossi25.`
- Mentee: `mentee@example.it` / `Mentee25.`

---

## Funzionalità principali (script demo)
1) Login come mentee → Catalogo → filtri → apri profilo mentor → prenota slot
2) Logout → Login come mentor → Dashboard → imposta link meeting (Zoom/Meet)
3) A sessione conclusa: login mentee → Dashboard → lascia recensione

---

## Struttura progetto
- `server/` backend Express + API REST
- `public/` frontend statico (Bootstrap + jQuery)
- `db/` schema e seed
- `docs/` documentazione (API, deploy, ER diagram)

---

## Documentazione
- API: `docs/api.md`
- Deploy: `docs/deploy.md`
- ER Diagram: `docs/er-diagram.png`

---

## Variabili d’ambiente (principali)
- `DATABASE_URL` (obbligatoria)
- `SESSION_SECRET` (obbligatoria)
- Email (opzionali: se non configurate, stampa su console)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

---

## Test
```bash
npm test
```

---

## Branch Git richiesti (consegna)
- `frontend`
- `backend`
- `db`
- `devops`

---

## Deploy cloud (Render) – riassunto
Vedi `docs/deploy.md`. In breve:
1) Crea Postgres su Render
2) Crea Web Service Node:
   - Build: `npm install`
   - Start: `npm start`
3) Env vars:
   - `DATABASE_URL`, `SESSION_SECRET`
   - (se richiesto) `DATABASE_SSL=true`
4) Esegui `db/schema.sql` e `db/seed.sql` sul DB cloud
