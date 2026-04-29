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

async function write_document(collection, document, arg) {
    const ref = db.collection(collection).doc(document);
    await ref.set(...args);
}

async function update_collection(collection, document, arg) {
    const ref = db.collection(collection).doc(document);
    await ref.set(args, { merge: true });
}

async function read_document(collection, document,) {
    const ref = db.collection(collection).doc(document);
    const doc = await ref.get();
    return doc.data();
}

async function delete_collection(collection, document) {
    const ref = db.collection(collection).doc(document);
    await ref.delete();
}

module.exports = { write_to_collection: write_document, update_collection, read_collection: read_document, delete_collection, db, bucket };
