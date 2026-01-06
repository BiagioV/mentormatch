# Deploy su Render (linee guida)

1) Crea un database Postgres su Render.
2) Crea un Web Service Node:
   - Build command: `npm install`
   - Start command: `npm start`
3) Imposta env vars:
   - DATABASE_URL (da Render)
   - SESSION_SECRET
   - (opz.) SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM
   - DATABASE_SSL=true (se richiesto da Render)
4) Esegui schema/seed sul DB (da psql o console Render):
   - db/schema.sql
   - db/seed.sql
