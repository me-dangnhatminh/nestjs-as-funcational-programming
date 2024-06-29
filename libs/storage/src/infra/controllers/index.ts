import FileUpdateUseCase from './file-update';
import FileUploadUseCase from './file-upload';
import FolderUpdateUseCase from './folder-update';
import FolderContentUseCase from './folder-content';
import FolderCreateUseCase from './folder-create';
import { FolderUploadUseCase } from './folder-upload';

export const controllers = [
  FileUploadUseCase,
  FileUpdateUseCase,
  FolderCreateUseCase,
  FolderContentUseCase,
  FolderUpdateUseCase,
  FolderUploadUseCase,
];
export default controllers;
