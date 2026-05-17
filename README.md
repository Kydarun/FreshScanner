# FreshScan AI 🥬📸

FreshScan is a modern, AI-powered Progressive Web App (PWA) built to analyze the freshness of raw food in real-time. By utilizing the device's camera and Google's Gemini Vision API, the app instantly identifies raw food (including specific meat cuts) and categorizes it as Fresh, Expiring Soon, or Spoiled.

## 🚀 Key Features

- **Live Camera Integration:** Native WebRTC camera capture within the browser.
- **Gemini Vision AI:** Zero-shot image evaluation powered by `gemini-flash-lite-latest` using dynamic markdown prompts.
- **Edge Case Handling:** Smart detection for `NOT_FOOD` (laptops, faces) and `UNCLEAR` (blurry/dark) images.
- **Offline-First History:** Guests save scans to `localStorage`. Once authenticated via Google, data automatically bulk-syncs to Firebase Firestore.
- **Internationalization (i18n):** Full support for English, Chinese Simplified (zh-CN), and Chinese Traditional (zh-TW).
- **Progressive Web App (PWA):** Installable on mobile devices with a standalone native feel.

## 🏗️ Architecture & Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Deployment:** Vercel (Serverless API Routes)
- **State Management:** TanStack Query (React Query)
- **Database & Auth:** Firebase (Firestore + Authentication)
- **Design:** TailwindCSS v4 + Lucide React (Glassmorphism UI)
- **Patterns:** Object-Oriented Data Access (`ScanRepository.ts`), Absolute Imports (`@/*`), Context Providers (`AuthContext.tsx`).

## 🛠️ Getting Started

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Run Locally

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Firestore Security Rules
To enable cloud syncing, ensure your Firestore database is created and deploy the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scan_history/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```
