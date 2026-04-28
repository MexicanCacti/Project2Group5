const {google} = require('googleapis');
const crypto = require('crypto');

/*
    See: https://developers.google.com/identity/protocols/oauth2/scopes
    For the scopes that can be added
 */
const scopes = [
    'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/photoslibrary.sharing',
    'https://www.googleapis.com/auth/photospicker.mediaitems.readonly'
]

/*
    See: https://developers.google.com/identity/protocols/oauth2/web-server#node.js
    For how to generate auth credentials
 */
function CreateOAuthClient(){
    return new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
    );
}

function InitOAuth(req, res) {
    const OAuth2Client = CreateOAuthClient();
    const state = crypto.randomBytes(32).toString('hex');

    req.session.state = state;
    req.session.username = req.query.username;


    return OAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        state: state,
        prompt: 'consent'
    });
}

async function HandleOAuthCallback(req, res) {
    const OAuth2Client = CreateOAuthClient();

    const { code, state } = req.query;

    if(!code){
        return res.status(400).json({error: 'Code Missing'});
    }

    if(!req.session.state || state !== req.session.state){
        return res.status(400).json({error: 'State mismatch'});
    }

    const username = req.session.username;

    if(!username){
        return res.status(400).json({error: 'Username missing'});
    }

    const {tokens} = await OAuth2Client.getToken(code);

    OAuth2Client.setCredentials(tokens);

    return {tokens, username};
}

module.exports = {InitOAuth, HandleOAuthCallback, CreateOAuthClient};