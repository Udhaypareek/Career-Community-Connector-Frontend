# Career Community Connector

Career Community Connector is a web application designed to facilitate connections among individuals within the same professional domain. It offers various features to enhance networking, learning, and collaboration within the community.

## Features

### 1. Login Page
Users can sign in to their accounts securely to access the platform's features.

### 2. Home Page (Fututre Enhancement)
Upon successful login, users are redirected to the home page where they can find four main sections:

- **Personal Chat**: Allows users to engage in private conversations with other users.
- **Global Chat**: Provides a platform for users to interact with others within the same professional domain.
- **Question Generator**: Generates random questions related to the user's selected domain to foster learning and knowledge sharing.
- **Ask Any Doubt**: Enables users to post questions or doubts they have, and receive assistance from peers or AI-generated answers.

### 3. Navbar(Future Enhancement)
The navigation bar at the top of the page provides users with access to various details and features, including:

- **User Profile**: Users can view their profile details, including the time spent on the website and the number of questions answered correctly.
- **Settings**: Allows users to customize their preferences and account settings.
- **Logout**: Logs the user out of the platform.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time Communication**: Socket.io

## Installation

1. Clone the repository:


2. Install dependencies:
cd career-community-connector
npm install


3. Set up environment variables:

Create a `.env` file in the root directory and add the necessary environment variables:

PORT=3000
MONGODB_URI= 
JWT_SECRET=your_jwt_secret_key



4. Start the server: npm start

5. Access the application at `http://localhost:3000` in your browser.

## Contributing

Contributions are welcome! Please feel free to open issues or pull requests to suggest improvements or report bugs.

