// Express framework ko import kiya (ye server banane ke kaam aata hai)
import express from "express";

// HTTP module import kiya (ye Express ke saath socket.io use karne ke liye zaroori hai)
import http from "http";

// socket.io ko import kiya (real-time connection handle karta hai frontend aur backend ke beech)
import { Server } from "socket.io";

// path module import kiya (static files ka sahi path set karne ke liye use hota hai, future use ke liye)
import path from "path";

// Express ka app banaya, jisse server start hoga
const app = express();

// Express ke app ke upar ek HTTP server banaya (ye zaroori hai taaki Socket.IO uske upar kaam kare)
const server = http.createServer(app);

// Socket.IO ka server banaya aur usme CORS enable kiya
// CORS ka matlab hai ki koi bhi frontend (chahe kisi bhi port pe ho) is server se connect kar sakta hai
const io = new Server(server, {
  cors: {
    origin: "*", // "*" ka matlab — sabhi origins allow hain (dev ke liye sahi hai)
  },
});

// Ek Map banaya jisme sabhi rooms ka data store hoga
// Map basically ek object jaise hota hai jisme 'roomId' key hoti hai, aur uske value hoti hai Set of users
// Eg: { "room123": Set("Himanshu", "Ravi") }
const rooms = new Map();

// Jab bhi koi user connect kare (yaani kisi ne browser pe site open kiya ho), to yeh chalega
io.on("connection", (socket) => {
  console.log("User Connected", socket.id); // Har user ka unique socket ID hota hai, usko console me dikhaya

  // Har user ke liye uska current room aur uska naam store karne ke liye variables banaye
  let currentRoom = null;
  let currentUser = null;

  // Jab user kisi room ko join kare, to yeh code chalega
  socket.on("join", ({ roomId, userName }) => {
    // Pehle check kiya ki kya user already kisi room me tha
    if (currentRoom) {
      // Agar tha, to us room ko chhoda do (leave)
      socket.leave(currentRoom);

      // Room ke Set (yaani user list) se user ka naam hata do
      rooms.get(currentRoom).delete(currentUser);

      // Room ke bache huye users ko updated user list bhejo
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    // Ab naye room aur naye user ka data store karo
    currentRoom = roomId;
    currentUser = userName;

    // Socket ko naye room mein join kara do
    socket.join(roomId);

    // Agar room pehli baar ban raha hai to ek Set banao (Set = unique users ki list)
    // Set isliye use karte hain kyunki ye same naam ko duplicate nahi hone deta
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set()); // Set bana ke Map me store kiya
    }

    // Us room ke Set me user ko add karo
    rooms.get(roomId).add(userName);

    // Us room ke sabhi users ko notify karo ki user list update ho gayi hai
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));

    // Console me room ID print karo
    console.log("user Joined room", roomId)
  });
});

// Server ko port 5000 pe start karo (ya environment me jo bhi port set ho uspe)
const port = process.env.PORT || 5000;

// Server chalu hone ke baad console me message print karo
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
