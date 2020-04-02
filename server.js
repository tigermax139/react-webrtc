const http = require("http");
const fs = require("fs");
const path = require("path");
const socketIO = require("socket.io");
const _ = require("lodash");

const server = http.createServer((req, res) => {
  const stream = fs.createReadStream(path.join(__dirname, "src", "test.html"));
  res.writeHead(200);
  stream.pipe(res);
});
const io = socketIO(server);

const users = {};

io.on("connection", function(socket) {
  console.log("Socket connection success!");
  socket.on("new_user", function({ id, ...userData }) {
    console.log("New user", { id, userData });
    users[id] = { ...userData, socketId: socket.id };
    io.emit("new_user", {
      user: {
        id, name: userData.name
      }
    });
  });
  socket.on("remove_user", ({ userId }) => {
    delete users[userId];
    io.emit("remove_user", { userId });
  });
  socket.on("send_offer", ({ userId, offer }) => {
    console.log("Offer", { userId });
    if (!users[userId]) {
      return;
    }

    const { socketId } = users[userId];
    io.to(socketId).emit("offer", { userId, offer });
  });
  socket.on("send_answer", ({ userId, answer }) => {
    console.log("Answer", { userId });
    if (!users[userId]) {
      return;
    }

    const { socketId } = users[userId];
    io.to(socketId).emit("answer", { userId, answer });
  });
  socket.on("send_ice_candidate", ({ userId, iceCandidate }) => {
    console.log("Ice candidate", { userId, iceCandidate });
    if (!users[userId]) {
      return;
    }

    const { socketId } = users[userId];

    io.to(socketId).emit("ice_candidate", { userId, iceCandidate });
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on ${port} port ...`));