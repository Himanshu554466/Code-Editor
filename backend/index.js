// Importing necessary modules
import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";

// Creating an Express application
const app = express();
// Creating an HTTP server using Express
const server = http.createServer(app);

// Initializing Socket.io server with CORS enabled for all origins
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// A Map to store room data, including users, startTime, and code output
const rooms = new Map();

// Handle new socket connection
io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  // Handle user joining a room
  socket.on("join", ({ roomId, userName }) => {
    // If already in a room, leave it and update the user list
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).users.delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom).users));
    }

    // Update current room and user variables
    currentRoom = roomId;
    currentUser = userName;
    socket.join(roomId);

    // Create a new room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),         // Set of user names
        startTime: Date.now(),    // Timer starts when the room is created
        output: "",               // Stores the last compiled output
      });
    }

    // Add the user to the room
    const room = rooms.get(roomId);
    room.users.add(userName);

    // Send the room's start time to the newly joined user (for timer UI)
    socket.emit("startTime", room.startTime);

    // Notify all users in the room about the updated user list
    io.to(roomId).emit("userJoined", Array.from(room.users));
  });

  // Broadcast code changes to other users in the room
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  // Handle user leaving a room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(room.users));
      }
      socket.leave(currentRoom);

      // If room is empty after leaving, delete the room
      if (room && room.users.size === 0) {
        rooms.delete(currentRoom);
      }

      currentRoom = null;
      currentUser = null;
    }
  });

  // Notify others when a user is typing
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  // Notify others about language change
  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  // Handle code compilation using Piston API
  socket.on("compileCode", async ({ code, roomId, language, version }) => {
    if (rooms.has(roomId)) {
      // Send code to Piston API for execution
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language,
          version,
          files: [
            {
              content: code,
            },
          ],
        }
      );

      // Save the output and send it to all users in the room
      rooms.get(roomId).output = response.data.run.output;
      io.to(roomId).emit("codeResponse", response.data);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(room.users));

        // Delete the room if no users remain
        if (room.users.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
    console.log("user Disconnected");
  });
});

// Start the server on the specified port (default is 5000)
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log("server is working on port 5000");
});
