# Testing

## Obiettivo
Avere test automatici che coprono funzionalità chiave:
- login
- catalogo mentor
- flusso prenotazione (booking + annullamento)

## Setup consigliato (DB separato per test)
1) Crea un database: `mentormatch_test`
2) Nel file `.env` aggiungi:
```env
DATABASE_URL_TEST=postgres://postgres:LA_TUA_PASSWORD@localhost:5432/mentormatch_test
```
3) Esegui i test:
```bash
npm test
```

> I test eseguono automaticamente `db/schema.sql` e `db/seed.sql` sul DB di test (reset totale prima di ogni test).


---

## Come eseguire i test
Da root progetto:

```bash
npm test
```

---

## Come funzionano i test (reset DB automatico)
Prima di ogni test viene eseguito un reset completo del database di test:
- `db/schema.sql` (DROP/CREATE tabelle)
- `db/seed.sql` (inserimento dati demo: Mario/Mentee + slot + booking demo + review demo)

Questo garantisce test:
- **ripetibili** (stesso risultato ogni volta)
- **indipendenti** (uno non dipende dallo stato lasciato da un altro)

Il reset è gestito da: `server/__tests__/helpers/resetDb.js`.

---

## Test presenti e copertura

### 1) `server/__tests__/auth.test.js`
Verifica autenticazione e sessione:
- **Login mentee OK** (`POST /api/auth/login`) con credenziali demo
- **Endpoint “me”** (`GET /api/auth/me`) ritorna l’utente loggato (cookie di sessione mantenuto)
- **Login KO** con password errata (ritorna `401` + `CREDENZIALI_ERRATE`)

Copertura: **login + session management**.

---

### 2) `server/__tests__/mentors.test.js`
Verifica catalogo mentor e filtri:
- `GET /api/mentors` ritorna il mentor demo `mario@example.it`
- verifica che il mentor abbia almeno 1 slot `OPEN`
- `GET /api/mentors?hasAvailability=1` ritorna solo mentor con disponibilità (open_slots > 0)

Copertura: **catalogo mentor + filtri**.

---

### 3) `server/__tests__/booking.test.js`
Verifica il flusso principale end-to-end:
1) login mentee
2) lettura lista mentor e selezione di Mario
3) lettura slot disponibili del mentor
4) prenotazione di uno slot (`POST /api/bookings`)
5) verifica prenotazione in dashboard (`GET /api/bookings/mine`) con stato `BOOKED`
6) annullamento prenotazione (`POST /api/bookings/:id/cancel`)
7) verifica stato aggiornato a `CANCELLED`

Copertura: **prenotazione + dashboard + annullamento**.

---

### 4) `server/__tests__/smoke.test.js`
Test minimo per verificare che l’API risponda correttamente:
- `GET /api/auth/me` quando non loggato ritorna `user: null`

Copertura: **sanity check**.

---

