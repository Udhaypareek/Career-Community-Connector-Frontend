import './App.css';
import {Route, Routes } from "react-router-dom";
import Authpage from './Pages/Authpage';
import ChatPage from './Pages/ChatPage';
import Homepage from './Pages/Homepage';
import OnboardingPage from './Pages/OnboardingPage';
import VideocallPage from './Pages/VideocallPage';
import Videocall from './components/videocall/videocall';
import Whiteboard from './components/miscellaneous/Whiteboard';
import CallOverlay from './components/videocall/CallOverlay';
import CallStatusToast from './components/videocall/CallStatusToast';

function App() {
  return (
    <div className="App">
      <CallOverlay />
      <CallStatusToast />
        <Routes>
          <Route path="/login" element={<Authpage />}  />
          <Route path="/" element={<Homepage />} exact/>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/videocall_landing" element={<VideocallPage />} />
          <Route path="/videocall" element={<Videocall />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
        </Routes>
    </div>
  );
}


export default App;
