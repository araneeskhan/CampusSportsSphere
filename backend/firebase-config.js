// firebase-config.js
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyAZsllAnWqCGMFOt4saTbYGxHBK_gQ_KxU",
  authDomain: "campussportssphere-7f23f.firebaseapp.com",
  projectId: "campussportssphere-7f23f",
  storageBucket: "campussportssphere-7f23f.appspot.com",
  messagingSenderId: "661686787234",
  appId: "1:661686787234:web:7aa7c969e1941fd9650bfb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

module.exports = { db, auth };
module.exports.default = firebaseConfig;
