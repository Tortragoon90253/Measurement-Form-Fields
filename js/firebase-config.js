// =====================================================
// กรอก Firebase Config ของคุณที่นี่
// วิธีหา config:
//   1. ไปที่ https://console.firebase.google.com
//   2. เลือก Project ของคุณ
//   3. Project Settings (⚙) → Your apps → Add Web App
//   4. Copy config object แล้ววางแทนค่าด้านล่าง
// =====================================================
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// ตั้งค่าให้ Firebase เก็บ session ไว้ใน browser (ไม่ต้อง login ใหม่ทุกครั้ง)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
