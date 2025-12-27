# TASKMANAGER Backend
This directory contains the backend code for the TaskManager application. It exposes a RESTful API for managing tasks.

## Environment Variables

All sensitive configuration (database, API keys, email, etc.) is managed via environment variables. See [ENVIRONMENT_VARIABLES_TEMPLATE.md](ENVIRONMENT_VARIABLES_TEMPLATE.md) for a full list and instructions. Copy this template to your `.env` file and fill in the values. **Never commit your actual `.env` file to version control.**

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
2. Create a `.env` file in `/backend` by copying [ENVIRONMENT_VARIABLES_TEMPLATE.md](ENVIRONMENT_VARIABLES_TEMPLATE.md) and filling in your secrets:
    ```
    cp ENVIRONMENT_VARIABLES_TEMPLATE.md .env
    # Then edit .env and fill in your values
    ```
3. Start the backend server:
    ```
    npm run dev
    ```

## License

MIT License
