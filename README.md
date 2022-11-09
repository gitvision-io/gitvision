# gitvision

Gitvision is an open source web application that provides git organization managers with a overview dashboard of their organization repositories statistics such as contributors, reviews and issues.

## How to run

### Prerequisites

- Github OAuth application: To run this application, you need to create a Github OAuth application with the `http://localhost:3000/api/auth/callback/github` callback url. This is need to enable the user to login with Github.
- Redis: you need a Redis server running. This is needed to store the synchronization job queue (used by the [Bull](https://github.com/OptimalBits/bull) queue system)

### Using the docker compose file

The easiest way to run Gitvision is by running the docker compose file, which contains service definition for all the applications necessary.

Just fill out the required [Environment variables](#environment-variables) in the compose file, and run `docker compose up -d`.
The application will be available at [http://localhost:3000](http://localhost:3000)

### From source

If you want to run the application from the source file, you need to follow those steps:

- Fill out the required [Environment variables](#environment-variables) in the .env or .env.local files of each folder (api, client)
- Run `npm install` inside each application folder (api, client)
- Run the `npm run dev` command for all folders (api, client) in separate terminals
  The application will be available at [http://localhost:3000](http://localhost:3000)

### Environment variables

You can create a .env.local file in the api and client folders.
Sample key and values are set in .env files

Here is the list of environment variables:

#### For the api

- **GIT_PROVIDER_NAME**: The name of the git provider to connect to (github or gitlab)
- **GIT_PROVIDER_TOKEN**: The personal access token of the git provider to connect to
- **REDIS_HOST** (required): the host for the Redis server
- **REDIS_PORT** (required): the port for the Redis server
- **REDIS_PASSWORD** (optional): the password for the Redis server

#### For the client

- **NEXT_PUBLIC_API_URL** (required): the public URL for the API
- **SERVER_API_URL** (required): the private URL for the API for server to server calls
