// =====================================================
// กรอก Firebase Config ของคุณที่นี่
// วิธีหา config:
//   1. ไปที่ https://console.firebase.google.com
//   2. เลือก Project ของคุณ
//   3. Project Settings (⚙) → Your apps → Add Web App
//   4. Copy config object แล้ววางแทนค่าด้านล่าง
// =====================================================
const firebaseConfig = {
  apiKey:            "AIzaSyDw2wpPrZ_Fc8K8z5EbtuM2q4hqZUk98UU",
  authDomain:        "body-tracker-be95d.firebaseapp.com",
  projectId:         "body-tracker-be95d",
  storageBucket:     "body-tracker-be95d.firebasestorage.app",
  messagingSenderId: "1066675321046",
  appId:             "1:1066675321046:web:a7a7d5344e20c96c517177",
  measurementId:     "G-87CCPRE3K4"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// ตั้งค่าให้ Firebase เก็บ session ไว้ใน browser (ไม่ต้อง login ใหม่ทุกครั้ง)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
