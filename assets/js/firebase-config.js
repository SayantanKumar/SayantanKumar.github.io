/* ===================================================================
   firebase-config.js — Firebase project credentials.

   HOW TO FILL THIS IN
   ───────────────────
   1. Go to https://console.firebase.google.com and create a project
      (e.g. "snoroozi-portfolio").

   2. Inside the project, click "Add app" → Web (</>).
      Copy the firebaseConfig object Firebase gives you and paste the
      values into the FIREBASE_CONFIG object below.

   3. In the Firebase console, open Firestore Database → Create database.
      Start in production mode, then paste the security rules below.

   4. Recommended Firestore security rules
      (Firestore → Rules tab → replace the default and Publish):

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {

          // Raw visit log — append-only from any browser
          match /visitors/{docId} {
            allow create: if true;
            allow read, update, delete: if false;
          }

          // City aggregates — readable by all, writable (create/update) from browser
          match /visitor_cities/{docId} {
            allow read:   if true;
            allow create: if true;
            allow update: if true;
            allow delete: if false;
          }

          // Aggregated totals — same as cities
          match /meta/{docId} {
            allow read:   if true;
            allow create: if true;
            allow update: if true;
            allow delete: if false;
          }
        }
      }

   5. Commit this file.  The API key is safe to expose in a public
      repo as long as the Firestore rules above are in place —
      they prevent destructive operations from anonymous clients.
   =================================================================== */

  const firebaseConfig = {
    apiKey: "AIzaSyBAPmWjr4sNkh4IFjgahYderTQ7OTUe0ZE",
    authDomain: "snoroozi-visitor.firebaseapp.com",
    projectId: "snoroozi-visitor",
    storageBucket: "snoroozi-visitor.firebasestorage.app",
    messagingSenderId: "787470321604",
    appId: "1:787470321604:web:124677f0c13ca7c5238691",
    measurementId: "G-ZFL5FRR8MC"
  };
