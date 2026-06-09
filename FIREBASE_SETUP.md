# Firebase Guestbook Setup Guide

Follow these steps to set up Firebase for your portfolio guestbook:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "lhenna-portfolio")
4. Click **Continue**
5. Disable Google Analytics (optional)
6. Click **Create project**

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname (e.g., "Portfolio Website")
3. **Do NOT** check "Firebase Hosting" (unless you want to host on Firebase)
4. Click **Register app**
5. Copy the `firebaseConfig` object shown

## Step 3: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose your Cloud Firestore location (closest to you)
5. Click **Enable**

## Step 4: Set Firestore Rules

1. In Firestore, go to the **"Rules"** tab
2. Replace the rules with this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbook/{entry} {
      // Allow anyone to read guestbook entries
      allow read: if true;
      
      // Allow anyone to create new entries (with validation)
      allow create: if request.resource.data.keys().hasAll(['name', 'message', 'timestamp'])
                    && request.resource.data.name is string
                    && request.resource.data.message is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.name.size() <= 50
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 500;
      
      // Prevent updates and deletes (only you can do this from console)
      allow update, delete: if false;
    }
  }
}
```

3. Click **Publish**

## Step 5: Add Your Firebase Config

1. Open `index.html`
2. Find this section (around line 14):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace it with YOUR config from Step 2

## Step 6: Test It!

1. Open your portfolio in a browser
2. Click the **Links** button to open the Links window
3. Scroll down to the guestbook form
4. Enter a name and message
5. Click **post**
6. Your message should appear in the guestbook entries section below the polaroids in the home window!

## Managing Entries

To delete spam or inappropriate entries:

1. Go to Firebase Console → Firestore Database
2. Navigate to the `guestbook` collection
3. Click on any entry to delete it manually

## Security Notes

- The current rules allow anyone to post (no authentication required)
- Name and message are limited to 50 and 500 characters respectively
- Users cannot edit or delete entries (only you can via Firebase Console)
- Consider adding rate limiting or reCAPTCHA if you get spam

## Troubleshooting

**"Firebase not configured yet"** error:
- Make sure you replaced the Firebase config in `index.html`

**Nothing shows up after posting:**
- Check browser console for errors
- Make sure Firestore rules are published
- Check that the collection name is exactly `guestbook`

**Entries don't appear:**
- The guestbook entries display in the HOME window (below polaroids)
- Not in the Links window (only the form is there)

---

✨ Your guestbook is now live! Messages will appear in real-time.
