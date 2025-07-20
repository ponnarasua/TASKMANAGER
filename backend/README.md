# TASKMANAGER Backend

This directory contains the backend code for the TaskManager application. It exposes a RESTful API for managing tasks.

## Features

- RESTful API for task CRUD operations
- Database integration (e.g., MongoDB)
- Request validation & error handling
- (Optional) User authentication

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
    npm start
    ```

## API Endpoints

| Method | Endpoint     | Description         |
|--------|-------------|---------------------|
| GET    | /tasks      | List all tasks      |
| GET    | /tasks/:id  | Get a single task   |
| POST   | /tasks      | Create a new task   |
| PUT    | /tasks/:id  | Update a task       |
| DELETE | /tasks/:id  | Delete a task       |

## License

MIT License
