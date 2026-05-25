import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';


import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import ChatProvider from './Context/ChatProvider';
import theme from './theme';

import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
        <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter>
          <ChatProvider>
            <App/>
          </ChatProvider>
    </BrowserRouter>
        </ChakraProvider>
);