import { useState } from "react";
import './App.css'
import io from "socket.io-client";

const socket = io("http://localhost:5000");
function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");

  const joinRoom = () =>{
    if(roomId && userName){
      socket.emit("join",{roomId,userName})
      setJoined(true);
    }
  }

  const copyRoomId = () =>{

  }

  if (!joined) {
    return (
      <>
        <div className="join-container">
          <div className="join-form">
            <h1> Join Code Room</h1>
            <input
              type="text"
              placeholder="Room Id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
             <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
      </>
    );
  }

  return <div className="editor-container">
    <div className="sidebar">
      <div className="room-info">
        <h2>Code Room : {roomId}</h2>
        <button onClick={copyRoomId} className="copy-button">Copy Id</button>
      </div>
      <h3> Users in Room:</h3>
      <ul>
        <li>Prem</li>
        <li>sunny</li>
        <li>Mahadev</li>
      </ul>
      <p className="typing-indicator "> user typing.....</p>
    </div>
  </div>;
}

export default App;
