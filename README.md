# QikTalk — Backend

The real-time API and Socket.IO server behind **QikTalk**, a one-to-one and group
chat app. Built with **Node.js + Express 5**, **Socket.IO 4**, **MongoDB (Mongoose 8)**,
and **JWT** auth stored in an httpOnly cookie.

> Frontend lives in the sibling [`qiktalk`](../qiktalk) repo.

---

## Features

- **Auth** — register / login / logout with bcrypt-hashed passwords and JWTs in an httpOnly cookie.
- **Direct messages & groups** — create DMs (deduplicated per pair) and named group conversations.
- **Real-time messaging** — messages are persisted and fanned out to every participant over Socket.IO.
- **Live presence** — an in-memory registry tracks who is online and broadcasts `online`/`offline`
  transitions instantly; `lastseen` is persisted for "last seen…" display.
- **User search** — case-insensitive username lookup for starting chats and building groups.

---

## Tech stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Runtime        | Node.js                         |
| HTTP framework | Express 5                       |
| Realtime       | Socket.IO 4                     |
| Database       | MongoDB via Mongoose 8          |
| Auth           | JWT (`jsonwebtoken`) + bcrypt   |
| Cookies        | `cookie-parser` / `cookie`      |

---

## Project structure

```
qiktalk-backend/
├── app.js                  # Express + HTTP + Socket.IO bootstrap
├── config/
│   └── db.js               # Mongoose connection
├── routes/                 # Express routers (thin)
│   ├── userRoutes.js
│   ├── conversationRoutes.js
│   └── messageRoutes.js
├── controllers/            # Request/response handling
│   ├── userController.js
│   ├── conversationController.js
│   └── messageController.js
├── services/               # Business logic (DB access, auth, presence)
│   ├── auth.js             # JWT verify, REST + socket auth middleware
│   ├── userServices.js
│   ├── conversationServices.js
│   ├── messageServices.js
│   └── presence.js         # In-memory online registry (ref-counted)
├── sockets/                # Socket.IO event handlers
│   ├── index.js            # Wires auth + per-connection handlers
│   ├── userSockets.js      # Presence + room join
│   ├── messageSockets.js   # sendMessage
│   └── conversationSockets.js  # createConversation, addToGroup
└── models/                 # Mongoose schemas
    ├── usermodel.js
    ├── conversationmodel.js
    └── messagemodel.js
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable      | Description                                                        | Example                              |
| ------------- | ------------------------------------------------------------------ | ------------------------------------ |
| `CORS_ORIGIN` | Frontend origin allowed for CORS **and** Socket.IO.                | `http://localhost:5173`              |
| `MONGO_URI`   | MongoDB connection string (local `mongod` or Atlas).               | `mongodb://127.0.0.1:27017/QikTalk`  |
| `PORT`        | Port the server listens on.                                        | `4501`                               |
| `JWT_SECRET`  | Secret used to sign JWTs (use a long random string in production). | `a-long-random-string`               |

### 3. Run

```bash
npm run dev    # development with auto-restart (nodemon)
npm start      # production (node app.js)
```

Health check: `GET /` responds with `API for QikTalk`.

---

## Deploy with Docker

The repo ships a multi-stage `Dockerfile` (slim, non-root runtime, built-in health check)
and a `docker-compose.yml`. **MongoDB runs as a separate container** that the backend reaches
over a shared Docker network — so one database can serve several MERN apps.

### Recommended — shared `mern` network

1. **Create the shared network** once (reused by all your MERN apps):

   ```bash
   docker network create mern
   ```

2. **Run MongoDB** on it as its own container, with a persistent volume:

   ```bash
   docker run -d --name mongo --network mern \
     -v mongo-data:/data/db --restart unless-stopped mongo:7
   ```

3. **Start the backend** — it joins `mern` and finds Mongo by container name:

   ```bash
   cp .env.example .env          # set CORS_ORIGIN, JWT_SECRET, ...
   docker compose up --build -d
   ```

The API is published on `http://localhost:4501`. Compose sets
`MONGO_URI=mongodb://mongo:27017/QikTalk`, where `mongo` is resolved by Docker's DNS on the
`mern` network. If your Mongo container has a different name/alias, update that value (in
`docker-compose.yml` or your `.env`).

```bash
docker compose logs -f backend   # follow logs
docker compose down              # stop the backend (Mongo keeps running)
```

### Alternative — host networking (Linux)

If you instead run Mongo with `--network=host`, run the backend on the host network too and
reach Mongo over `localhost`:

```bash
docker build -t qiktalk-backend .

docker run -d --name qiktalk-backend --network=host \
  -e MONGO_URI="mongodb://127.0.0.1:27017/QikTalk" \
  -e CORS_ORIGIN="https://your-frontend.example.com" \
  -e JWT_SECRET="a-long-random-string" \
  -e PORT=4501 \
  qiktalk-backend
```

- `--network=host` is **Linux-only** (limited/unsupported on Docker Desktop for Mac/Windows).
- Host mode **ignores `-p`**; the app binds `PORT` directly on the host.

### Managed MongoDB (Atlas)

Skip the local Mongo and the `mern` network entirely — point `MONGO_URI` at your cluster and
run the image standalone:

```bash
docker build -t qiktalk-backend .

docker run -d --name qiktalk-backend -p 4501:4501 \
  -e MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/QikTalk" \
  -e CORS_ORIGIN="https://your-frontend.example.com" \
  -e JWT_SECRET="a-long-random-string" \
  qiktalk-backend
```

The image's `HEALTHCHECK` polls `GET /`; check it with `docker ps` (look for `healthy`).

---

## Authentication

- On register/login the server signs a JWT (`{ email }`) and sets it as an **httpOnly `token` cookie**.
- **REST**: protected routes use the `authenticate` middleware, which reads the cookie, verifies the
  JWT, and attaches the Mongoose user document to `req.user`.
- **Socket.IO**: the `socketAuth` middleware verifies the token from `handshake.auth.token`
  (falling back to the cookie) and attaches the user to `socket.user`. Unauthenticated sockets are
  rejected, so every connection has a trusted identity.

The browser must send credentials (`withCredentials: true` for both axios and Socket.IO).

---

## REST API

All protected routes require the auth cookie. Responses use the shape
`{ success: boolean, data?, message? }`.

### Users

| Method | Path                       | Auth | Body / Params                       | Description                              |
| ------ | -------------------------- | ---- | ----------------------------------- | ---------------------------------------- |
| POST   | `/createUser`              | —    | `{ username, email, password }`     | Register; sets the token cookie.         |
| POST   | `/login`                   | —    | `{ email, password }`               | Login; sets the token cookie.            |
| GET    | `/logout`                  | ✅    | —                                   | Clears the token cookie.                 |
| GET    | `/verify`                  | ✅    | —                                   | Returns the current user.                |
| POST   | `/updateUser`              | ✅    | `{ username, email, password }`     | Update password for a user.              |
| GET    | `/searchUsernames`         | ✅    | `?searchString=`                    | Username search (excludes self).         |
| GET    | `/getOnlineStatus/:userId` | ✅    | `:userId`                           | `{ online, lastSeen }` for a user.       |

### Conversations

| Method | Path                     | Auth | Body / Params                    | Description                          |
| ------ | ------------------------ | ---- | -------------------------------- | ------------------------------------ |
| POST   | `/createDM`              | ✅    | `{ targetUserId }`               | Create/reuse a DM.                   |
| POST   | `/createGroup`           | ✅    | `{ participantIds, groupName }`  | Create a group.                      |
| POST   | `/addToGroup`            | ✅    | `{ participantIds, groupId }`    | Add members to a group.              |
| GET    | `/getConversations`      | ✅    | —                                | Conversations for the current user. |
| GET    | `/:conversationId/user`  | ✅    | `:conversationId`                | Participants of a conversation.      |
| GET    | `/:conversationId`       | ✅    | `:conversationId`                | Conversation details (no messages). |

### Messages

| Method | Path                       | Auth | Body / Params                       | Description                       |
| ------ | -------------------------- | ---- | ----------------------------------- | --------------------------------- |
| GET    | `/messages/:conversationId`| ✅    | `:conversationId`                   | Messages in a conversation.       |
| POST   | `/sendMessage`             | ✅    | `{ message, conversationId }`       | Persist a message (REST path).    |

> In practice the frontend sends messages over the socket (`sendMessage` event) so they
> are delivered live; the REST endpoint remains for non-socket clients.

---

## Socket.IO events

Connect with the auth token (and `withCredentials: true`). Identity is taken from the
authenticated socket — clients never need to announce who they are.

### Client → Server

| Event                | Payload                                                              | Notes                                                                 |
| -------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `presence:request`   | —                                                                   | Server replies with `presence:snapshot` (useful after a reconnect).   |
| `joinConversation`   | `conversationId`                                                    | Joins the conversation room.                                          |
| `sendMessage`        | `{ message, conversationId }`                                       | Sender is `socket.user`; broadcasts `newMessage` to all participants. |
| `createConversation` | `{ conversationType: "dm", targetUserId }` or `{ conversationType: "group", participantIds, groupName }` | Acknowledged via callback `{ success, conversation?, error? }`; emits `newConversation` to participants. |
| `addToGroup`         | `{ participantIds, groupId }`                                       | Emits `newConversation` (updated group) to members.                   |

### Server → Client

| Event                | Payload                                       | Notes                                                            |
| -------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `presence:snapshot`  | `string[]` (online userIds)                   | Sent on connect and on `presence:request`.                       |
| `presence:update`    | `{ userId, online, lastSeen? }`               | Broadcast when a user goes online/offline.                       |
| `newMessage`         | populated message                             | New message in a conversation the client participates in.        |
| `newConversation`    | conversation                                  | A DM/group was created or updated; refetch conversation list.    |
| `errorMessage`       | `string`                                      | A socket operation failed.                                       |

---

## How presence works

`online` is **ephemeral runtime state**, so it is not stored in a boolean DB field.

1. On every authenticated connection, the socket joins a **personal room** (`userId`) and is
   recorded in an in-memory, **reference-counted** registry (`services/presence.js`). Multiple
   tabs/devices count as multiple connections.
2. When a user's **first** socket connects they transition offline → online, and the server
   broadcasts `presence:update { online: true }`. The connecting client also receives a
   `presence:snapshot` of everyone currently online.
3. When a user's **last** socket disconnects they transition online → offline; the server writes
   `lastseen = now` to MongoDB and broadcasts `presence:update { online: false, lastSeen }`.
4. `GET /getOnlineStatus/:userId` returns the live `online` flag (or the persisted `lastSeen`)
   so a freshly opened chat shows the correct status immediately; subsequent changes arrive live.

---

## Data models

**User**

```js
{ username, email, password /* bcrypt hash */, lastseen: Date | null }
```

**Conversation**

```js
{ type: "dm" | "group", participants: [User], messages: [Message], groupName, updatedAt }
```

**Message**

```js
{ sender: User, body: String, seen: Map<userId, Date>, updatedAt }
```

---

## Troubleshooting

- **Mongo connection errors** — ensure `mongod` is running (or your Atlas string/IP allowlist is
  correct) and that `MONGO_URI` is set; `config/db.js` throws early if it is missing.
- **CORS / cookie issues** — `CORS_ORIGIN` must exactly match the frontend origin, and the frontend
  must use `withCredentials: true`. Cross-site cookies in production require HTTPS and appropriate
  `SameSite`/`Secure` settings.
- **Socket won't connect (Unauthorized)** — the client must be logged in so the JWT cookie/token is
  present in the handshake.

---

## Roadmap

See [`TODO.md`](./TODO.md) — system messages, group admin roles, and read receipts.
