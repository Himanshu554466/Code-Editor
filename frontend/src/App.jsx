
import { useState } from 'react'
import io from 'socket.io-client'


const socket = io('http://localhost:5000')
function App() {
 
  const [joined,setJoined] = useState(true);
  if(joined){
    return (
      <>
        <div>App</div>
      </>
    )

  }

  return <div> App not joined</div>
}

export default App
