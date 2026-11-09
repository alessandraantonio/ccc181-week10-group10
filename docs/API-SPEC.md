# CampusConnect API Specification (v1)

The contract between the React front end and the Express backend.
Base address (development): `http://localhost:3000/api/v1`

All request and response bodies are JSON. Every error has the shape `{ "error": "<message>" }`.

## 1. Required endpoints

| Method | Endpoint | Purpose | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/health` | Checks that the API is running. | 200 OK | none |
| POST | `/api/v1/sessions` | Logs in. A *session* is the thing you create when you log in. | 200 OK | 400, 401 |
| GET | `/api/v1/users/me` | Returns the logged-in user. Needs a token. | 200 OK | 401 |

Why `sessions` and not `/login`? Endpoint names have no verbs: the method (POST) is the
verb, and the address names the thing being created (the session).

## 2. Request and response examples

### GET /api/v1/health

`200 OK`

```json
{ "status": "ok" }
```

### POST /api/v1/sessions

Request body:

```json
{ "email": "student@campusconnect.test", "password": "Campus26" }
```

`200 OK`: login succeeded. The token expires in 1 hour.

```json
{
  "token": "<a long token text>",
  "user": { "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" }
}
```

`400 Bad Request`: email or password is missing, not text, too long, or the email is badly formed.

```json
{ "error": "Email and password are required." }
```

`401 Not logged in`: wrong password **or** unknown email. The message is the same for both.

```json
{ "error": "Invalid email or password." }
```

> **Why the same 401 message for both?** If the message said "email not found", an
> attacker could find out which emails exist. The API never gives away more than needed.

### GET /api/v1/users/me

Send the token from the login in this header:

```
Authorization: Bearer <token>
```

`200 OK`

```json
{ "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" }
```

`401 Not logged in`: token missing, wrong, tampered with, or expired.

```json
{ "error": "Not logged in." }
```

## 3. Other answers every route can give

| Situation | Status | Body |
| --- | --- | --- |
| Unknown address (or a method the address does not support) | 404 | `{ "error": "Not found." }` |
| Unexpected crash on the server | 500 | `{ "error": "Something went wrong." }` |

## 4. Status codes used

| Code | Meaning in this API |
| --- | --- |
| 200 | The request worked (health, login, users/me). |
| 400 | The request body is missing or badly formed. |
| 401 | Wrong login, or no valid token. |
| 404 | No such address. |
| 500 | The server failed. No stack trace is ever sent to the client. |

## 5. Demo account

| Field | Value |
| --- | --- |
| Email | `student@campusconnect.test` |
| Password | `Campus26` |
| Name | Demo Student |

Passwords are stored hashed with bcrypt (`bcryptjs`), never as plain text, and the password
or its hash is never sent in any response.

## 6. Design notes (security and REST rules)

- **Stateless:** the server remembers nothing between calls. Every request to `/users/me`
  carries its own token. That is why Log out only deletes the token on the front end.
- **Token:** a JWT signed with `JWT_SECRET` (kept in `server/.env`, never committed),
  algorithm HS256, expires in 1 hour. Tokens signed with another secret, with another
  algorithm, or expired are rejected with 401.
- **CORS:** only the address in `CLIENT_ORIGIN` (`http://localhost:5173`) may call the API from a browser.
- **Validation:** the backend checks every body itself, whatever the front end did.
- **Versioned and plural:** all addresses start with `/api/v1`. Resources are nouns.

---

## Events (design only, not built)

The school events page from the Week 10 examples. These endpoints are designed on paper
only. They follow the Week 12 conventions: plural nouns, the method is the verb, filters in
the query string, a version in the address, and no nesting deeper than two levels.

| Method | Endpoint | What it does | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/events` | List all events. | 200 OK | none |
| GET | `/api/v1/events?month=11` | List only the events in November (filter). Can be combined: `?month=11&sort=date`. | 200 OK | 400 if `month` is not 1 to 12 |
| GET | `/api/v1/events/12` | Get one event. | 200 OK | 404 if event 12 does not exist |
| POST | `/api/v1/events` | Add a new event. | 201 Created | 400 missing or bad field, 401 not logged in, 403 not allowed |
| PATCH | `/api/v1/events/12` | Change only some fields of event 12. | 200 OK | 400, 401, 403, 404 |
| DELETE | `/api/v1/events/12` | Remove event 12. | 204 No Content | 401, 403, 404 |

Example event (JSON):

```json
{
  "id": 12,
  "title": "CBIT Tech Talk",
  "date": "2026-11-20",
  "place": "MSU-Naawan Gymnasium",
  "organizer": "CBIT"
}
```

`POST /api/v1/events` request body (all fields required):

```json
{
  "title": "CBIT Tech Talk",
  "date": "2026-11-20",
  "place": "MSU-Naawan Gymnasium",
  "organizer": "CBIT"
}
```

`PATCH /api/v1/events/12` request body (only the fields that change):

```json
{ "place": "Audio-Visual Room" }
```

Design decisions:

- `GET` is open to everyone, so students can browse without logging in. `POST`, `PATCH` and
  `DELETE` need a token (401 if missing) and an organizer account (403 if the user is logged in but not allowed).
- `PATCH` (not `PUT`) is used to change part of an event, so the client sends only what changed.
- `DELETE` returns 204 with no body. Repeating it is safe (the event is simply already gone).
- A missing required field is a 400. A valid request for an event that does not exist is a 404.
  The API never answers 200 with an error hidden inside.
- A later `GET /api/v1/events/12/registrations` (two levels deep) could list who registered for an event.
