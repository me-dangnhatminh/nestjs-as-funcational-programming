import { StorageRepository } from './storage.repository';
import * as z from 'zod';

export class StorageService {
  constructor(private readonly storageRepo: StorageRepository) {}
}
