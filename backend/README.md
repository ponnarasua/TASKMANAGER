# TASKMANAGER Backend

This directory contains the backend code for the TaskManager application. It exposes a RESTful API for managing tasks.

## Features

- RESTful API for task CRUD operations
- Database integration (e.g., MongoDB)
- Request validation & error handling
- User authentication

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)

## Setup

1. Install dependencies:
    ```
    npm install
    ```

2. Create a `.env` file in `/backend`:
    ```
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    ```

3. Start the backend server:
    ```
    npm run dev
    ```

## License

MIT License
