# QikTalk — Backend

REST API and Socket.IO server for **QikTalk**, a real-time chat app with direct messages,
group chats, live presence and avatars.

Built with **Express 5**, **Socket.IO 4**, **MongoDB / Mongoose 8**, **Zod** validation,
**JWT** auth in an httpOnly cookie, and **Cloudinary** for image storage.

> The web client lives in [`qiktalk`](https://github.com/mars985/qiktalk).

## Features

- **Accounts:** register, log in and log out. Passwords are hashed with bcrypt and the session is a JWT in an httpOnly cookie.
- **DMs and groups:** DMs are deduplicated per pair of users. Groups have a name, 3–100 members and an optional avatar.
- **Real-time messaging:** messages are saved to MongoDB and pushed to every participant over Socket.IO.
- **Live presence:** an in-memory, reference-counted registry broadcasts online and offline changes. `lastseen` is saved on disconnect.
- **Avatars:** user and group avatars are uploaded through multer, cropped to 512×512 on Cloudinary, and replaced or removed cleanly.
- **Validation:** every REST body, query and param, and every socket payload, is checked against a Zod schema.
- **Consistent responses:** success and error responses share the same JSON envelope.

## Tech stack

| Concern    | Choice                                 |
| ---------- | -------------------------------------- |
| Runtime    | Node.js ≥ 20                           |
| HTTP       | Express 5                              |
| Realtime   | Socket.IO 4                            |
| Database   | MongoDB via Mongoose 8                 |
| Validation | Zod 4                                  |
| Auth       | `jsonwebtoken` + `bcrypt`              |
| Uploads    | `multer` (temp disk) → Cloudinary      |
| Tooling    | nodemon, Prettier, GitHub Actions, PM2 |

## Project structure

```
src/
├── app.js            Express + HTTP + Socket.IO bootstrap
├── config/db.js      Mongoose connection
├── constants/        Limits and options (lengths, file size, cookie, group size)
├── routes/           Routers mounted under /api/v1
├── controllers/      Request/response handling
├── services/         Business logic, DB access, Cloudinary, presence registry
├── sockets/          Socket.IO handlers (user, message, conversation)
├── middlewares/      auth, validate, multer, cleanup, error
├── validators/       Zod schemas
├── models/           User, Conversation, Message
└── utils/            ApiError, ApiResponse, asyncHandler, file helpers
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB instance (local `mongod`, a Docker container, or Atlas)
- A Cloudinary account (needed only for avatar uploads)

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

| Variable                | Description                                         | Example                             |
| ----------------------- | --------------------------------------------------- | ----------------------------------- |
| `CORS_ORIGIN`           | Frontend origin allowed for CORS and Socket.IO.     | `http://localhost:5173`             |
| `MONGO_URI`             | MongoDB connection string.                          | `mongodb://127.0.0.1:27017/QikTalk` |
| `PORT`                  | Port for the HTTP + Socket.IO server.               | `4501`                              |
| `JWT_SECRET`            | Secret used to sign JWTs. Use a long random string. | `change_me`                         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name.                              |                                     |
| `CLOUDINARY_API_KEY`    | Cloudinary API key.                                 |                                     |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret.                              |                                     |

### Scripts

| Command       | Description                                  |
| ------------- | -------------------------------------------- |
| `npm run dev` | Start with nodemon (`NODE_ENV=development`). |
| `npm start`   | Start with node (`NODE_ENV=production`).     |

`GET /` responds with `API for QikTalk` and serves as the health check.

## Authentication

- Register and login sign a JWT (`{ _id }`, 2-day expiry) and set it as the `token` cookie with
  `httpOnly`, `secure`, `sameSite: "none"` and `partitioned`.
- **REST:** the `authenticate` middleware verifies the cookie and loads the user into `req.user`. On
  failure it clears the cookie and responds `401`.
- **Socket.IO:** `socketAuth` reads the token from `handshake.auth.token`, falling back to the cookie,
  and loads the user into `socket.user`. Connections without a valid token are rejected.

Clients must send credentials (`withCredentials: true` for both HTTP and Socket.IO). Because the cookie
is `secure`, cross-site setups need HTTPS.

## Response format

Successful responses:

```json
{ "statusCode": 200, "data": {}, "message": "Success", "success": true }
```

Errors, including validation failures, where `errors` holds the Zod issues:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": []
}
```

Socket acknowledgements use the same shapes.

## REST API

Every route is prefixed with **`/api/v1`**. 🔒 marks routes that need the auth cookie.

### Users — `/users`

| Method | Path                       |     | Input                                 | Description                                           |
| ------ | -------------------------- | --- | ------------------------------------- | ----------------------------------------------------- |
| POST   | `/register`                |     | `{ username, email, password }`       | Create an account and set the cookie.                 |
| POST   | `/login`                   |     | `{ email, password }`                 | Log in and set the cookie.                            |
| POST   | `/logout`                  | 🔒  |                                       | Clear the cookie.                                     |
| GET    | `/verify`                  | 🔒  |                                       | Return the current user.                              |
| POST   | `/updateUser`              | 🔒  | `{ username, email, password }`       | Update a user's password.                             |
| GET    | `/searchUsernames`         | 🔒  | `?searchString=` (3–50 chars)         | Case-insensitive username search, excluding yourself. |
| GET    | `/getOnlineStatus/:userId` | 🔒  |                                       | `{ online, lastSeen }` for a user.                    |
| POST   | `/uploadAvatar`            | 🔒  | `multipart/form-data`, field `avatar` | Upload or replace your avatar.                        |
| DELETE | `/removeAvatar`            | 🔒  |                                       | Remove your avatar.                                   |

### Conversations — `/conversations` 🔒

| Method | Path                             | Input                                 | Description                                                             |
| ------ | -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| GET    | `/`                              |                                       | Your conversations, newest first, with the last message and its sender. |
| POST   | `/createDM`                      | `{ targetUserId }`                    | Create or reuse a DM.                                                   |
| POST   | `/createGroup`                   | `{ participantIds, groupName }`       | Create a group (you are added automatically).                           |
| GET    | `/:conversationId`               |                                       | Conversation details (without messages).                                |
| GET    | `/:conversationId/users`         |                                       | Participants of the conversation.                                       |
| POST   | `/:conversationId/addToGroup`    | `{ participantIds }`                  | Add members to a group.                                                 |
| POST   | `/:conversationId/uploadAvatar`  | `multipart/form-data`, field `avatar` | Upload or replace the group avatar.                                     |
| DELETE | `/:conversationId/removeAvatar`  |                                       | Remove the group avatar.                                                |
| GET    | `/:conversationId/messages`      |                                       | Message history (participants only).                                    |
| POST   | `/:conversationId/messages/send` | `{ message }` (1–1024 chars)          | Send a message over REST.                                               |

The web client sends messages through the `sendMessage` socket event so they are delivered live. The REST
endpoint is for clients that don't use sockets.

### Validation limits

| Field      | Rule                                      |
| ---------- | ----------------------------------------- |
| Username   | 3–50 characters                           |
| Password   | 8–128 characters                          |
| Group name | 1–50 characters                           |
| Group size | 3–100 participants, including the creator |
| Message    | 1–1024 characters                         |
| Avatar     | JPEG, PNG, WebP or GIF, up to 5 MB        |

## Socket.IO events

Connect to the server root with credentials. The server identifies the user from the authenticated
handshake, so clients never send their own user ID. Each socket joins a personal room named after
its user ID, which the server uses to reach the user.

### Client → server

| Event              | Payload                         | Ack               | Effect                                                  |
| ------------------ | ------------------------------- | ----------------- | ------------------------------------------------------- |
| `sendMessage`      | `{ conversationId, message }`   | the saved message | Saves it and emits `newMessage` to every participant.   |
| `createDM`         | `{ targetUserId }`              | the conversation  | Creates or reuses a DM.                                 |
| `createGroup`      | `{ participantIds, groupName }` | the group         | Creates the group and emits `newGroup` to every member. |
| `addToGroup`       | `{ groupId, participantIds }`   | the updated group | Adds members and emits `newGroup` to every member.      |
| `joinConversation` | `conversationId`                |                   | Joins the conversation room.                            |
| `presence:request` |                                 |                   | The server replies with `presence:snapshot`.            |

### Server → client

| Event                 | Payload                           | When                                            |
| --------------------- | --------------------------------- | ----------------------------------------------- |
| `newMessage`          | `{ message, conversationId }`     | A message arrives in one of your conversations. |
| `newGroup`            | conversation                      | A group you're in is created or gains members.  |
| `conversationUpdated` | `{ conversationId, groupAvatar }` | A group's avatar is changed or removed.         |
| `presence:snapshot`   | `string[]` of online user IDs     | On connect and after `presence:request`.        |
| `presence:update`     | `{ userId, online, lastSeen? }`   | A user comes online or goes offline.            |

## How presence works

Online status is runtime state, so it is kept in memory and only `lastseen` is written to MongoDB.

1. Each authenticated socket increments a per-user connection count in `presence.service.js`, so multiple
   tabs and devices are counted separately.
2. When a user's first socket connects, the server broadcasts `presence:update { online: true }`.
   The new socket also receives a `presence:snapshot`.
3. When a user's last socket disconnects, the server saves `lastseen` and broadcasts
   `presence:update { online: false, lastSeen }`.
4. `GET /users/getOnlineStatus/:userId` returns the current state, so a newly opened chat is correct
   before the next live update arrives.

Because the registry lives in process memory, presence assumes a single server instance.

## Avatar uploads

1. `multer` writes the file to a per-request folder under `public/temp/`, enforcing the type and size limits.
2. The service uploads it to Cloudinary with an eager 512×512 `fill` crop and stores the cropped URL and
   its `public_id`.
3. Uploading a new avatar deletes the old one from Cloudinary.
4. The cleanup middleware deletes the temp folder once the response finishes, whether the request
   succeeded or failed.

`public_id` fields are never sent to clients.

## Data models

```js
User         { username, email, password, avatar, avatarPublicId, lastseen }
Conversation { type: "dm" | "group", participants: [User], messages: [Message],
               groupName, groupAvatar, groupAvatarPublicId, updatedAt }
Message      { sender: User, body, seen: Map<userId, Date>, updatedAt }
```

`password`, `*PublicId` and `__v` are removed whenever a document is serialised to JSON.

## Docker

The repo includes a multi-stage `Dockerfile` (slim runtime, non-root user, health check on `GET /`)
and a `docker-compose.yml` that expects MongoDB to run in its own container on a shared external
`mern` network:

```bash
docker network create mern
docker run -d --name mongo --network mern -v mongo-data:/data/db --restart unless-stopped mongo:7
docker compose up --build -d
```

Compose overrides `MONGO_URI` to `mongodb://mongo:27017/QikTalk` and publishes port `4501`. To use
Atlas instead, build the image and pass your own `MONGO_URI` with `docker run -e`.

## CI/CD

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

- **check:** `npm ci`, `prettier --check .`, then boots the app against a MongoDB service container
  and requests `GET /`.
- **deploy** (pushes to `main` only): joins a Tailscale tailnet, SSHes into the server, fast-forwards
  the checkout to the pushed commit, runs `npm ci --omit=dev`, restarts the `api-qiktalk` PM2 process
  and checks that `GET /` responds.

The deploy job uses secrets `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `SSH_HOST` and `SSH_USER`, and
variables `APP_DIR` and `APP_PORT` (default `4501`), all in the `production` environment.
