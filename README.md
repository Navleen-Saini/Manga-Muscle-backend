# Manga-Muscle
Manga-Muscle Backend

This repository contains the backend server for the Manga-Muscle fitness web application. It is built with Node.js, Express.js, and MongoDB to handle user authentication, session management, and data persistence.

Key features:

User Authentication – Secure registration and login using bcrypt for password hashing and express-session with MongoDB session store.

RESTful API Endpoints – Provides endpoints for user management, session tracking, and exercise data.

Session Management – Tracks the last visited muscle group to enhance user experience.

Pug Templating – Dynamic rendering of registered users and individual contact pages.

Error Handling – Custom 404 and 500 error pages with proper logging.

Security Best Practices – Sensitive data like database URIs, cookie secrets, and bcrypt salt rounds are stored in .env and ignored in Git.

Technologies Used:

Node.js

Express.js

MongoDB & Mongoose

Pug templating

bcrypt for password hashing

express-session & connect-mongo

Usage:

Clone the repository.

Install dependencies: npm install

Create a .env file with MONGO_URI, COOKIE_SECRET, and SALT_ROUNDS.

Start the server: node mainApp.js

Access the application at http://localhost:3001.

This backend is designed to be scalable, secure, and easy to integrate with a separate frontend repository.
