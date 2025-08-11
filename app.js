// -------------------- Imports --------------------
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// -------------------- App Setup --------------------
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- HTTP + Socket Server --------------------
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// -------------------- Routes --------------------
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

app.get("/", (req, res) => {
  res.send("hey");
});

app.use("/", userRoutes);
app.use("/", messageRoutes);
app.use("/", conversationRoutes);

// -------------------- Sockets --------------------
require("./sockets")(io); // pass `io` into your sockets file

// -------------------- Start Server --------------------
server.listen(3000, () => {
  // console.log("Server running on http://localhost:3000");
});
