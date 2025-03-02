import './App.css';
import {Route, Routes } from "react-router-dom";
import Authpage from './Pages/Authpage';
import ChatPage from './Pages/ChatPage';
import Homepage from './Pages/Homepage';

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/login" element={<Authpage />}  />
          <Route path="/" element={<Homepage />} exact/>
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
    </div>
  );
}


export default App;
