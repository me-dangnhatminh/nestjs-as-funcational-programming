export enum ErrorTypes {
  StorageNotFound = 'StorageNotFound',
  FileNotFound = 'FileNotFound',
  NotEnoughSpace = 'NotEnoughSpace',
  NotPermitted = 'NotPermitted',
}
export type ErrorType = keyof typeof ErrorTypes;
