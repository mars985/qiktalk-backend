// -------------------- Imports --------------------
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// -------------------- App Setup --------------------
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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
    origin: process.env.CORS_ORIGIN,
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
const connectDb = require("./config/db");
const startServer = async () => {
  try {
    await connectDb();
    server.listen(process.env.PORT, () =>
      console.log("Listening on port " + process.env.PORT)
    );
  } catch (error) {
    console.error(error);
  }
};
startServer();
