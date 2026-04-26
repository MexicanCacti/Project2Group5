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

### ENV notes
<b> Create these before deploying! </b>

#### Project Root Directory .env
- SERVER_PORT: Port to expose for Express.js
- CLIENT_PORT: Port to expose for React

#### Server /server/.env
- GEMINI_API_KEY: Key for sending requests to the Gemini API

#### Client /client/.env
- No env required yet

### Google Cloud Deployment


```bash
gcloud app create
```
```bash
gcloud app deploy ./app.yaml
```
