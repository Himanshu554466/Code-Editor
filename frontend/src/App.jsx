import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");
function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("C++");
  const [code, setCode] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("update-code",(newCode) => {
      setCode(newCode);
    })
    

    return () => {
      socket.off("userJoined")
      socket.off("receive-code")
    }
  },[]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const joinRoom = () => {
    if (roomId && userName) {
      socket.emit("join", { roomId, userName });
      setJoined(true);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 4000);
  };

  const handlecodechange = (newCode) => {
    setCode(newCode);
    //connect our editior with socket
    socket.emit("code-change", { roomId, code: newCode });
  };

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

  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <h2>Code Room : {roomId}</h2>
          <button onClick={copyRoomId} className="copy-button">
            Copy Id
          </button>
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        <h3> Users in Room:</h3>
        <ul>
          {users.map((user, index) => ( 
            // map the user
            <li key={index}>{user.slice(0,8)}....</li>
          ))}
        </ul>
        <p className="typing-indicator "> user typing.....</p>
        <select
          className="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button className="leave-button"> Leave</button>
      </div>
      <div className="editor-wrapper">
        <Editor
          height={"100%"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handlecodechange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}

export default App;
