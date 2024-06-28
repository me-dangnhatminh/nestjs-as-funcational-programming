import FileContentUseCase from './file-content';
import FileUploadUseCase from './file-upload';
import { FolderContentUseCase } from './folder-content';

export const controllers = [
  FileUploadUseCase,
  FileContentUseCase,
  FolderContentUseCase,
];
export default controllers;
