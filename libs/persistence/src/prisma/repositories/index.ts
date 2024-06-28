export * from './user.repository';
export * from './storage.repository';

import { storageRepository } from './storage.repository';
import { userRepository } from './user.repository';

export const repositories = [userRepository, storageRepository];
export default repositories;
