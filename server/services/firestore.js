const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccount.json");

const databaseID = process.env.DATABASE_ID

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore(admin.app(), databaseID);

module.exports = { db };