# Seasonal Gift Shop (Firebase)

A fully working HTML/CSS/JS shop website with:
- 4 categories: Valentines, Mothers Day, Fathers Day, Christmas
- 3 sample products in each category (12 total)
- Login/Register at top-right (Firebase Email/Password)
- Working cart with quantity controls
- Checkout that saves orders to Firestore
- Dark/Light theme toggle with saved preference

## 1) Firebase Console Setup

1. Create a Firebase project.
2. Enable **Authentication** -> **Email/Password**.
3. Enable **Firestore Database** (start in production mode).
4. In **Project settings** -> **General** -> **Your apps**, create a Web App and copy config.

## 2) Add Firebase Config

Open `app.js` and replace:
- `REPLACE_WITH_YOUR_API_KEY`
- `REPLACE_WITH_YOUR_AUTH_DOMAIN`
- `REPLACE_WITH_YOUR_PROJECT_ID`
- `REPLACE_WITH_YOUR_STORAGE_BUCKET`
- `REPLACE_WITH_YOUR_MESSAGING_SENDER_ID`
- `REPLACE_WITH_YOUR_APP_ID`

Open `.firebaserc` and replace:
- `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`

## 3) Firestore Rules

Deploy provided rules from `firestore.rules` so authenticated users can create/read their own orders.

## 4) Run Locally

Open `index.html` with a local server (recommended), for example:

```bash
npx serve .
```

Then visit the shown localhost URL.

## 5) Deploy to Firebase Hosting

Install CLI and deploy:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## Notes

- Cart and theme are persisted in browser `localStorage`.
- Checkout requires login.
- Orders are stored in Firestore collection: `orders`.
