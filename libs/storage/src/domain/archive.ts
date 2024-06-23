import { v4 as uuid } from 'uuid';
export type FileRef = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date | null;
  removedAt: Date | null;
};

const FileRef = (
  name: string,
  size: number,
  type: string,
  createdAt: Date = new Date(),
  updatedAt: Date | null = null,
  removedAt: Date | null = null,
  id: string = uuid(),
): FileRef =>
  Object.freeze({ id, name, size, type, createdAt, updatedAt, removedAt });
