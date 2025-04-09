// Express framework ko import kiya (server banane ke liye)
import express from "express";

// HTTP module import kiya (Express ke saath socket.io use karne ke liye)
import http from "http";

// socket.io server import kiya (real-time communication ke liye)
import { Server } from "socket.io";

// path module import kiya (static files ka path set karne ke liye)
import path from "path";

// Express app initialize kiya
const app = express();

// HTTP server create kiya Express ke saath
const server = http.createServer(app);

// Socket.IO server initialize kiya, CORS allow kiya (sabhi origin se connection allow)
const io = new Server(server, {
  cors: {
    origin: "*", // development ke liye sabhi connections allowed
  },
});

// Sabhi rooms ka data store karne ke liye Map banaya
const rooms = new Map();

// Jab koi user connect kare (editor open kare) to ye chalega
io.on("connection", (socket) => {
  console.log("User Connected", socket.id); // console mein user ki socket ID dikhayi

  // Current user kis room mein hai aur uska naam kya hai, ye store karne ke liye
  let currentRoom = null;
  let currentUser = null;

  // Jab user kisi room mein join kare
  socket.on("join", ({ roomId, userName }) => {
    // Agar user pehle se kisi aur room mein tha, to usse remove karo
    if (currentRoom) {
      socket.leave(currentRoom); // purane room se nikaalo
      rooms.get(currentRoom).delete(currentUser); // uska naam room se hatao
      // Room mein baaki users ko updated list bhejo
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    // Naye room aur user ko set karo
    currentRoom = roomId;
    currentUser = userName;

    // Socket ko naye room mein join karao
    socket.join(roomId);

    // Agar room pehli baar ban raha ho to uske liye Set banayein
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    // Room ke users mein current user ko add karo
    rooms.get(roomId).add(userName);

    // Room ke sabhi users ko updated user list bhejo or notify kr denge baaki sbko
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });

  
});

// Server ko port 5000 (ya jo environment mein set ho) pe chalu karo
const port = process.env.PORT || 5000;

// Server start ho gaya to console mein message dikhayein
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
