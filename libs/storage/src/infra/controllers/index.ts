import FileContentUseCase from './file-content';
import FileUploadUseCase from './file-upload';
import { FolderContentUseCase } from './folder-content';
import { FolderCreateUseCase } from './folder-create';

export const controllers = [
  FileUploadUseCase,
  FolderCreateUseCase,
  FolderContentUseCase,
];
export default controllers;
