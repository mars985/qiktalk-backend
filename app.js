const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const path = require("path");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// root
app.get("/", (req, res) => {
  res.send("hey");
});

// CRUD routes
const userAPI = require("./api/userAPI");
const messageAPI = require("./api/messageAPI");

userAPI(app);
messageAPI(app);

// Socket.io
io.on("connect", (socket) => {
  console.log("A user connected" + socket.id);
});


server.listen(3000);
