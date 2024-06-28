export * from './user.repository';
export * from './storage.repository';

import { StorageRepository } from './storage.repository';
import { userRepository } from './user.repository';

export const repositories = [userRepository, StorageRepository];
export default repositories;
