import admin from 'firebase-admin';
import { env } from './env';
import * as fs from 'fs';
import * as path from 'path';

const initialize_firebase = (): void => {
  if (admin.apps.length > 0) {
    return;
  }

  let credential: admin.credential.Credential;

  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const service_account_path = path.resolve(env.FIREBASE_SERVICE_ACCOUNT_PATH);

    if (!fs.existsSync(service_account_path)) {
      console.error(`Firebase service account file not found: ${service_account_path}`);
      process.exit(1);
    }

    const service_account = JSON.parse(
      fs.readFileSync(service_account_path, 'utf-8')
    );
    credential = admin.credential.cert(service_account);
  } else if (
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  ) {
    credential = admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    console.error(
      'Firebase credentials not configured. Provide either FIREBASE_SERVICE_ACCOUNT_PATH or individual credentials.'
    );
    process.exit(1);
  }

  admin.initializeApp({ credential });
  console.log('Firebase Admin SDK initialized');
};

initialize_firebase();

export const firebase_auth = admin.auth();
export default admin;
