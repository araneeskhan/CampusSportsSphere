const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteExpiredReservations = functions.pubsub.schedule("every 1 minutes")
    .onRun(async (context) => {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const reservationsRef = db.collection("reservations");
      const snapshot = await reservationsRef.where("endTime", "<=", now).get();

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log("Expired reservations deleted");
    });
