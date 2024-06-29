import FileUpdateUseCase from './file-update';
import FileUploadUseCase from './file-upload';
import FolderUpdateUseCase from './folder-update';
import FolderContentUseCase from './folder-content';
import FolderCreateUseCase from './folder-create';

export const controllers = [
  FileUploadUseCase,
  FileUpdateUseCase,
  FolderCreateUseCase,
  FolderContentUseCase,
  FolderUpdateUseCase,
];
export default controllers;
