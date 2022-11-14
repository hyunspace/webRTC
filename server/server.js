const express = require("express");
const http = require("http");
const cors = require("cors");
const twilio = require("twilio");

const PORT = process.env.PORT || 5002;
const app = express();
const server = http.createServer(app);

app.use(cors());

let connectedUsers = [];
let rooms = [];

// create route to check if room exists
app.get("/api/room-exists/:guildId", (req, res) => {
  let { guildId } = req.params;
  let videoId = null;

  let roomsList = rooms.filter((room) => {
    return room.guildId == guildId;
  });

  for (i = 0; i < 3; i++) {
    if (
      !roomsList.find(
        (room) => room.id === guildId.toString() + "-" + i.toString()
      )
    ) {
      const newRoom = {
        id: guildId.toString() + "-" + i.toString(),
        videoId,
        guildId,
        connectedUsers: [],
      };
      roomsList = [...roomsList, newRoom];
    }
  }

  console.log(roomsList);

  return res.send({ roomsList });
});

app.get("/api/get-turn-credentials", (req, res) => {
  const accountSid = "AC7cff1792ce0f8d410f4790a5048eeeb7";
  const authToken = "c9f5e65fe22c2e6764d5ca5530d4970c";

  const client = twilio(accountSid, authToken);

  res.send({ token: null });
  try {
    client.tokens.create().then((token) => {
      res.send({ token });
    });
  } catch (err) {
    console.log("error occurred when fetching turn server credentials");
    console.log(err);
    res.send({ token: null });
  }
});

app.get("/api/get-turn-credentials", (req, res) => {
  const accountSid = "AC7cff1792ce0f8d410f4790a5048eeeb7";
  const authToken = "c9f5e65fe22c2e6764d5ca5530d4970c";

  const client = twilio(accountSid, authToken);

  res.send({ token: null });
  try {
    client.tokens.create().then((token) => {
      res.send({ token });
    });
  } catch (err) {
    console.log("error occurred when fetching turn server credentials");
    console.log(err);
    res.send({ token: null });
  }
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);

  socket.on("create-new-room", (data) => {
    createNewRoomHandler(data, socket);
  });

  socket.on("join-room", (data) => {
    joinRoomHandler(data, socket);
  });

  socket.on("disconnect", () => {
    disconnectHandler(socket);
  });

  socket.on("conn-signal", (data) => {
    signalingHandler(data, socket);
  });

  socket.on("conn-init", (data) => {
    initializeConnectionHandler(data, socket);
  });

  socket.on("direct-message", (data) => {
    directMessageHandler(data, socket);
  });
});

// socket.io handlers

const createNewRoomHandler = (data, socket) => {
  console.log("host is creating new room");
<<<<<<< HEAD
=======
  console.log(data);
  const { identity, onlyAudio } = data;
>>>>>>> feeb7ea335cd97e46cff21bb63f8153ab8719a5c

  const { identity, videoId, learningRecordId, roomId, guildId } = data;

  // create new user
  const newUser = {
    identity,
    socketId: socket.id,
    roomId,
<<<<<<< HEAD
    learningRecordId,
=======
    onlyAudio,
>>>>>>> feeb7ea335cd97e46cff21bb63f8153ab8719a5c
  };

  // push that user to connectedUsers
  connectedUsers = [...connectedUsers, newUser];

  //create new room
  const newRoom = {
    id: roomId,
    videoId,
    guildId,
    connectedUsers: [newUser],
  };
  // join socket.io room
  socket.join(roomId);

  rooms = [...rooms, newRoom];

  // emit to that client which created that room roomId
  // socket.emit("room-id", { roomId });

  // emit an event to all users connected
  // to that room about new users which are right in this room
  console.log(rooms);
  socket.emit("room-update", newRoom);
};

const joinRoomHandler = (data, socket) => {
<<<<<<< HEAD
  const { identity, roomId, learningRecordId } = data;
=======
  const { identity, roomId, onlyAudio } = data;
>>>>>>> feeb7ea335cd97e46cff21bb63f8153ab8719a5c

  const newUser = {
    identity,
    socketId: socket.id,
    roomId,
<<<<<<< HEAD
    learningRecordId,
=======
    onlyAudio,
>>>>>>> feeb7ea335cd97e46cff21bb63f8153ab8719a5c
  };

  // join room as user which just is trying to join room passing room id
  const room = rooms.find((room) => room.id === roomId);
  room.connectedUsers = [...room.connectedUsers, newUser];

  // join socket.io room
  socket.join(roomId);

  // add new user to connected users array
  connectedUsers = [...connectedUsers, newUser];

  // emit to all users which are already in this room to prepare peer connection
  room.connectedUsers.forEach((user) => {
    if (user.socketId !== socket.id) {
      const data = {
        connUserSocketId: socket.id,
      };

      io.to(user.socketId).emit("conn-prepare", data);
    }
  });

  io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
  // find if user has been registered - if yes remove him from room and connected users array
  const user = connectedUsers.find((user) => user.socketId === socket.id);

  if (user) {
    // remove user from room in server
    const room = rooms.find((room) => room.id === user.roomId);

    room.connectedUsers = room.connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );

    // leave socket io room
    socket.leave(user.roomId);

    // close the room if amount of the users which will stay in room will be 0
    if (room.connectedUsers.length > 0) {
      // emit to all users which are still in the room that user disconnected
      io.to(room.id).emit("user-disconnected", { socketId: socket.id });

      // emit an event to rest of the users which left in the toom new connectedUsers in room
      io.to(room.id).emit("room-update", {
        connectedUsers: room.connectedUsers,
      });
    } else {
      rooms = rooms.filter((r) => r.id !== room.id);
    }
  }
};

const signalingHandler = (data, socket) => {
  const { connUserSocketId, signal } = data;

  const signalingData = { signal, connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-signal", signalingData);
};

// information from clients which are already in room that They have preapred for incoming connection
const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;

  const initData = { connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-init", initData);
};

const directMessageHandler = (data, socket) => {
  if (
    connectedUsers.find(
      (connUser) => connUser.socketId === data.receiverSocketId
    )
  ) {
    const receiverData = {
      authorSocketId: socket.id,
      messageContent: data.messageContent,
      isAuthor: false,
      identity: data.identity,
    };
    socket.to(data.receiverSocketId).emit("direct-message", receiverData);

    const authorData = {
      receiverSocketId: data.receiverSocketId,
      messageContent: data.messageContent,
      isAuthor: true,
      identity: data.identity,
    };

    socket.emit("direct-message", authorData);
  }
};

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
