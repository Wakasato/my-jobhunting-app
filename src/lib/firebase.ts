import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ここでは「.env.local から値を読み込め」という命令だけを書きます
const firebaseConfig = {
    apiKey: "AIzaSyCkOZ4svLx8N0O114aPyyX4KvJnRCoyXzk",
    authDomain: "my-job-app-25d5e.firebaseapp.com",
    projectId: "my-job-app-25d5e",
    storageBucket: "my-job-app-25d5e.firebasestorage.app",
    messagingSenderId: "4723250328",
    appId: "1:4723250328:web:49aadae86bbeda8671aced",
    measurementId: "G-YZQZZ4B8CL"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// データベース(Firestore)をエクスポート
export const db = getFirestore(app);

// 認証(Auth)をエクスポート
export const auth = getAuth(app);