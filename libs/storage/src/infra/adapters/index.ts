export * from './firebase.module';
export * from './multer.module';

import FirebaseModule from './firebase.module';
import MulterModule from './multer.module';

export const adapters = [FirebaseModule, MulterModule];
export default adapters;
