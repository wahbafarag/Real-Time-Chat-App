require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const messageFormat = require("./utils/message");
const {
  userJoined,
  getCurrentUser,
  userDisconnected,
  getRoomUsers,
} = require("./utils/users");
//
const app = express();
const port = process.env.PORT || 3000;
const httpServer = http.createServer(app);
const io = socketIo(httpServer);
const botName = "Chat-Cord";
// Serve static folders
app.use(express.static(path.join(__dirname, "public")));

// when a user connects
io.on("connection", (socket) => {
  // user joined the room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoined(socket.id, username, room);
    socket.join(user.room);
    // emit to a single client *welcome the current user*
    socket.emit("message", messageFormat(botName, "Welcome to Our ChatCord"));

    // emit to all clients except u
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        messageFormat("Chat-Cord", `${user.username} has joined the Chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // emit to all clients
  //io.emit();

  // get the chatMessages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", messageFormat(user.username, msg));
  });

  // when a client disconnect
  socket.on("disconnect", () => {
    const user = userDisconnected(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        messageFormat(
          botName,
          `${user.username} has Disconnected or left the Chat`
        )
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//
httpServer.listen(port, () => {
  console.log(`Starting on Port ${port}`);
});
