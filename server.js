const express = require("express");
const sassMiddleware = require("node-sass-middleware");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const dbConnection = require("./db/mongodb");
const srcPath = __dirname + "/scss";
const destPath = __dirname + "/public/styles";

dbConnection();

app
  .disable("x-powered-by")
  .set("views", "./views")
  .set("view engine", "ejs")
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(
    "/styles",
    sassMiddleware({
      src: srcPath,
      dest: destPath,
      debug: true,
      outputStyle: "expanded"
    })
  )
  .use(express.static("public"));

const rooms = {
  public: {
    users: {}
  }
};

app
  .get("/", (req, res) => {
    res.render("index", { rooms: rooms });
  })
  .get("/:room", (req, res) => {
    res.render("room", { roomName: req.params.room });
  })
  .post("/test", (req, res) => {
    res.json({ body: req.body });
  });

// ============ WebSocket ==========
const users = {};

io.on("connection", socket => {
  socket.on("connect", function(data) {
    users[socket.id] = data.id;
  });

  socket.on("public-chat", (room, message) => {
    socket.to("publicRoom").broadcast.emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id]
    });
  });

  socket.on("new-user", (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    users[socket.id] = socket.id;
    socket.to(room).broadcast.emit("user-connected", name);
    io.emit('online', getUsersOnline())
    // socket.emit('online', getUsersOnline())
  });

  socket.on("send-chat-message", (room, message) => {
    socket.to(room).broadcast.emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id]
    });
  });

  socket.on("disconnect", () => {
    if (getUsersOnline() !== 0) {
      const usersKeys = Object.keys(users);

      if (usersKeys.includes(socket.id)) {
        delete users[socket.id]
      }
    }

    getUserRooms(socket).forEach(room => {
      socket
        .to(room)
        .broadcast.emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
    
    io.emit('online', getUsersOnline())
  });
});

function getUsersOnline() {
  return Object.keys(users).length;
}

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

server.listen(5000, "localhost", () => {
  console.log(
    `WebServer started on http://${server.address().address}:${
      server.address().port
    }`
  );
});
