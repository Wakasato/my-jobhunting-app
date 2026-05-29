# 💼 JOB HUNTING LOG (Job Application Progress Tracker)
A modern, real-time dashboard application designed to centralize, track, and visualize job application progress and interview stages.
Built with a React (TypeScript) frontend and a Firebase (Cloud Firestore / Authentication) backend, this application provides a secure, fluid, and highly responsive user experience.
## 🔗 Live Demo Information
Production URL: https://my-jobhunting-app.vercel.app

Test Account:
- Email: demo@example.com
- Password: password123
(Pre-configured as a whitelisted test account. Log in directly without any 2-Step Verification / Multi-Factor Authentication requests).
Note: You can also sign up securely with your personal Google Account to create a fresh, isolated workspace.
## ✨ Key Features
Real-Time Progress Tracking (Cloud Firestore)
Add, edit, and delete job applications with fields like Company Name, Job Title, Application Date, Salary Range, and Status.
Real-time UI updates powered by Firestore subscriptions (onSnapshot).
Interactive Visualization Dashboard (Recharts)
Beautiful charts displaying distribution by application status and stage conversion rates.
Get an instant birds-eye view of your job hunt momentum.
Secure Multi-User Authentication (Firebase Auth)
Supports both Google OAuth (Popup) and classic Email/Password credentials.
Data Isolation Design: Server-side rules guarantee users can only see and modify their own data.
🛠️ Tech Stack
Frontend: React (TypeScript), Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization)
Backend (BaaS): Firebase Authentication, Cloud Firestore
Environment Management: Vite Env Variables (.env.local)
## Deployment & Hosting: Vercel
(Key Engineering Achievements)
This project was built following industry-best security practices, ensuring it is robust against common web vulnerabilities.
### 1. Granular Firestore Security Rules
Instead of relying on insecure "test mode" rules, this project enforces strict server-side rules in Firestore:
Ensures incoming requests are authenticated (request.auth != null).
Validates that the document's userId matches the authenticated user's uid before allowing read, write, or delete actions.
This prevents unauthorized direct API manipulations and guarantees absolute user data privacy.
### 2. Secure Environment Configuration & Key Rotation
API credentials and endpoints are entirely decoupled from the source code and the Git commit history.
Utilizes .env.local for local development, which is ignored via .gitignore to prevent accidental credential leakage on GitHub.
Production secrets are securely injected as encrypted Environment Variables through Vercel's hosting settings.
### 3. Frictionless Recruiting Experience
To ensure technical recruiters can evaluate the application instantly, the demo@example.com account is configured as an explicit Firebase Test Account.
This bypasses automated security checkpoints (such as verification emails, OTPs, or suspicious activity locks) while maintaining standard authentication flows.
## 🚀 Local Installation & Setup
### 1. Clone the Repository
git clone [https://github.com/Wakasato/my-jobhunting-app.git](https://github.com/Wakasato/my-jobhunting-app.git)
cd repository-name


### 2. Install Dependencies
npm install


### 3. Configure Environment Variables
Create a .env.local file in the root directory of the project and add your Firebase configurations:
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id


### 4. Run the Development Server
npm run dev


Open http://localhost:5173 in your browser to view the application in action.
