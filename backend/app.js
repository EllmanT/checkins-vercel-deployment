const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const ErrorHandler = require("./middleware/error");

// Handle events and emit data as needed

//app. uses
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static("uploads"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config

//dealing with the automatic listennig of events start

const http = require("http");
const socketIO = require("socket.io");
const socketServer = http.createServer(app);
const io = socketIO(socketServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with the origin of your frontend application
    methods: ["GET", "POST"], // Specify the allowed HTTP methods
    allowedHeaders: ["my-custom-header"], // Specify any custom headers you want to allow
    credentials: true, // Set to true if you want to allow sending cookies with the request
  },
});
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("update-visit", () => {
    try {
      console.log("update done");
      io.emit("update-complete", "completed", () => {
        console.log("update was done here");
      });
    } catch (error) {
      console.error("Error in update-visit event handler:", error);
    }
  });
  // Handle events and emit data as needed

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

socketServer.listen(3005, () => {
  console.log("Socket.IO server listening on port 3005");
});

//dealing with the automatic listenning of events end

if (process.env.NODE_URL !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

//declaring controllers
const user = require("./controller/user");
const deliverer = require("./controller/deliverer");
const contractor = require("./controller/contractor");
const overallStats = require("./controller/overallStats");
const contractorStats = require("./controller/contractorStats");
const visit = require("./controller/visit");

//using controllers
app.use("/api/v2/user", user);
app.use("/api/v2/deliverer", deliverer);
app.use("/api/v2/contractor", contractor);
app.use("/api/v2/overallStats", overallStats);
app.use("/api/v2/contractorStats", contractorStats);
app.use("/api/v2/visit", visit);

app.use(ErrorHandler);

module.exports = app;
