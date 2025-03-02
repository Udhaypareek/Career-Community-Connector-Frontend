import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';

// import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react';
import ChatProvider from './Context/ChatProvider';

// import Authpage from './Pages/Authpage';
// import ChatPage from './Pages/ChatPage';
// import Homepage from './Pages/Homepage';
import App from './App';

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Authpage />,
//   },
//   {
//     path: '/home',
//     element: <Homepage />,
//   },
//   {
//     path: '/chat',
//     element: <ChatPage />,
//   },
// ]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <ChakraProvider>
    <BrowserRouter>
          <ChatProvider>
            <App/>
          </ChatProvider>
    </BrowserRouter>
        </ChakraProvider>
  </React.StrictMode>
);