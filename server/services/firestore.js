const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccount.json");

const databaseID = process.env.DATABASE_ID

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(admin.app(), databaseID);
const bucket = admin.storage().bucket();

module.exports = { db, bucket , admin};