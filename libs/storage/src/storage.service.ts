import { StorageRepository } from './storage.repository';

export class StorageService {
  constructor(private readonly storageRepo: StorageRepository) {}
}
