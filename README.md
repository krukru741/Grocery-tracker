# Grocery Tracker & Budget Planner

A mobile-first web application built with React, Tailwind CSS, and Firebase.

## Features

- **User Authentication:** Secure login using Google Sign-In via Firebase Auth.
- **Barcode Scanner:** Scan product barcodes using your device's camera. Automatically fetches product details using the OpenFoodFacts API.
- **Grocery Tracking:** Add, edit, and delete grocery items. Organize by category and track prices.
- **Budget Planning:** Set a monthly grocery budget and track your spending in real-time.
- **Analytics:** Visualize your spending habits with interactive charts (by category and over time).
- **Cloud Storage:** All data is securely stored in Firebase Firestore, synced across your devices.
- **Dark Mode:** Fully supports system dark mode preferences.

## Setup Instructions for Firebase

This app uses Firebase for backend services. The AI Studio environment has already provisioned a Firebase project for you.

If you are setting this up locally or in a new environment:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project or select an existing one.
3. Enable **Authentication** and add the **Google** sign-in provider.
   - *Optional:* Enable Email/Password authentication if desired.
4. Enable **Firestore Database** and create a database in production mode.
5. Update your Firestore Security Rules with the contents of `firestore.rules`.
6. Go to Project Settings > General > Your apps, and add a Web App.
7. Copy the Firebase configuration object and place it in `firebase-applet-config.json`.

## Tech Stack

- **Frontend:** React 19, Vite, React Router v7
- **Styling:** Tailwind CSS v4, Lucide React (Icons)
- **Backend:** Firebase (Auth, Firestore)
- **Charts:** Recharts
- **Barcode Scanning:** html5-qrcode
- **Date Formatting:** date-fns

## Running Locally

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Build for production: `npm run build`
