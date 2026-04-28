# Running the Application

## Build and Run

### Local Deployment

*Note: Make sure Docker Engine is running on your machine!

From the project root directory:

```bash
npm run dev
```

## Tear Down
```bash
npm run down
```

## Rebuild
```bash
npm run rebuild
```

### Setup notes
<b> Create these before deploying! </b>

#### Project Root Directory .env
- SERVER_PORT: Port to expose for Express.js
- CLIENT_PORT: Port to expose for React

#### Server /server/.env
- GEMINI_API_KEY: Key for sending requests to the Gemini API
- DATABASE_ID: The name of the database

#### Client /client/.env
- No env required yet

### Server /server/services/serviceAccount.json
- When you create your database, go to the firebase console:
- -> Settings
- -> General
- -> Service accounts
- -> Generate new private key
- -> Copy and paste contents into serviceAccount

### Google Cloud Deployment


```bash
gcloud app create
```
```bash
gcloud app deploy ./app.yaml
```
### ENV notes /app.yaml
<b> Fill these before deploying! </b>
- SERVER_PORT: Port to expose for Express.js
- CLIENT_PORT: Port to expose for React
- GEMINI_API_KEY: Key for sending requests to the Gemini API
- DATABASE_ID: The name of the database

Basically, instead of local deployment having separate .env files for client/server, GAE deployment centralizes them into one under app.yaml
