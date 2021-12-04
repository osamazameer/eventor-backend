const path = require("path");
const http = require("http");
const mongoose = require("mongoose");
const express = require("express");
const socketio = require("socket.io");
const { userJoin, getCurrentUser } = require("./models/users");
const formatMessage = require("./models/messages");

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socketio(server);

//On Connection
io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("joinChat", ({ username, room }) => {
    //Welcome Current User
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      "message",
      formatMessage(user.username, `Welcome To ${user.room}`)
    );

    //All the users except user that has joined
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(user.username, "has joined the chat"));
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //When User Disconnects
  socket.on("disconnect", () => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit(
      "message",
      formatMessage(user.username, "has left the chat")
    );
  });
});

mongoose
  .connect(
    "mongodb+srv://testapp:shujja@cluster0.lzutz.mongodb.net/eventor-test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connection Successful!"))
  .catch((err) => console.log(err));

app.use(express.static(path.join(__dirname, "public")));
server.listen(PORT, () => {
  console.log(`Server Running at port ${PORT}`);
});
