# Career Community Connector (Frontend)

Career Community Connector is a real-time community chat and collaboration app. This README summarizes what the app currently does and the tech stack for both frontend and backend.

## Current Capabilities

- User authentication: sign up, log in, and persist sessions in local storage.
- User search: search users by name or email.
- 1:1 chat: create/access direct chats and view chat list.
- Group chat: create group chats, rename groups, add/remove members.
- Real-time messaging: send/receive messages with Socket.io updates.
- Typing indicators and message notifications.
- Whiteboard collaboration: live drawing and board clear events.
- Video calling: peer-to-peer calls with camera/mic, mute/video toggle, and screen share.

## Tech Stack

### Frontend

- React 18 with React Router
- Chakra UI and React Icons for UI
- Axios for REST API calls
- Socket.io client for realtime updates
- PeerJS for WebRTC video calling
- Fabric.js for the whiteboard canvas

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT authentication and bcrypt password hashing
- Socket.io for realtime messaging and whiteboard events
- CORS and dotenv for configuration

## Backend API (High-Level)

The frontend consumes these backend areas:

- Users: register, login, and user search
- Chats: access direct chats, list chats, create/rename group chats, add/remove members
- Messages: fetch and send messages per chat

## Environment Variables (Frontend)

Create a file in the frontend root (same folder as package.json):

```
REACT_APP_BACKEND_URL=http://localhost:5000
```

Restart the dev server after any changes to env files.

## Scripts

```
npm start
npm test
npm run build
```

