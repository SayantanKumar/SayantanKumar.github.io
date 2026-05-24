/* ===================================================================
   firebase-config.js — Firebase project credentials.

   The variable MUST be named FIREBASE_CONFIG (all caps) so that
   visitor-tracker.js can find it.  Do not rename it.

   Firestore security rules (paste these in Firebase Console →
   Firestore Database → Rules → replace all → Publish):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visitors/{docId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    match /visitor_cities/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
    match /meta/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}

   The API key is safe to commit publicly as long as the Firestore
   rules above are in place — they block destructive operations.
   =================================================================== */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBAPmWjr4sNkh4IFjgahYderTQ7OTUe0ZE",
  authDomain:        "snoroozi-visitor.firebaseapp.com",
  projectId:         "snoroozi-visitor",
  storageBucket:     "snoroozi-visitor.firebasestorage.app",
  messagingSenderId: "787470321604",
  appId:             "1:787470321604:web:124677f0c13ca7c5238691",
};
