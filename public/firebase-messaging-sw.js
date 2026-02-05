importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAW45Nx4ljmnqvr509jl3tK0SSje8wizrs",
  authDomain: "instagram-58230.firebaseapp.com",
  projectId: "instagram-58230",
  messagingSenderId: "470839495593",
  appId: "1:470839495593:web:bc1da0448bf19c1c7152b8",
});

// 🚨 THIS LINE WAS THE ISSUE
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Background message received:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAW45Nx4ljmnqvr509jl3tK0SSje8wizrs",
//   authDomain: "instagram-58230.firebaseapp.com",
//   projectId: "instagram-58230",
//   storageBucket: "instagram-58230.firebasestorage.app",
//   messagingSenderId: "470839495593",
//   appId: "1:470839495593:web:bc1da0448bf19c1c7152b8",
//   measurementId: "G-XRJC1195VY"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
