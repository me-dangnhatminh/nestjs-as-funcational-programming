import { Global, Injectable, Module } from '@nestjs/common';
import * as firebase from 'firebase-admin';

const AVATAR_BUCKET = 'avatars';

@Injectable()
export class FirebaseService {
  private readonly storage: firebase.storage.Storage;

  get bucket() {
    return this.storage.bucket();
  }

  constructor() {
    const serviceAcc = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: `${process.env.FIREBASE_PRIVATE_KEY}`.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    } as any;

    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAcc),
      storageBucket: serviceAcc.project_id + '.appspot.com',
    });
    this.storage = firebase.storage();
  }

  uploadAvatar(file: Express.Multer.File, id: string): Promise<string> {
    const key = [AVATAR_BUCKET, id].join('/');
    const fileRef = this.bucket.file(key);
    const stream = fileRef.createWriteStream();

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(file.buffer);
    });
  }

  getAvtarUrl(id: string): Promise<string | undefined> {
    const key = [AVATAR_BUCKET, id].join('/');
    const fileRef = this.bucket.file(key);

    return new Promise((resolve, reject) => {
      fileRef.getSignedUrl(
        { action: 'read', expires: Date.now() + 1000 * 60 * 60 * 24 }, // 24 hours
        (err, url) => (err ? reject(err) : resolve(url)),
      );
    });
  }

  deleteAvatar(id: string): Promise<void> {
    const key = [AVATAR_BUCKET, id].join('/');
    const fileRef = this.bucket.file(key);

    return new Promise((resolve, reject) =>
      fileRef.delete((err) => (err ? reject(err) : resolve())),
    );
  }
}

@Global()
@Module({})
export class FirebaseModule {}
export default FirebaseModule;
