import {
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class FileValidationPipe
  implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
  constructor() {}

  transform(file: Express.Multer.File): Express.Multer.File {
    return file;
  }
}

const NotEnoughFreeSpace = (freeSpace: number) =>
  new BadRequestException(`Not enough free space, ${freeSpace} bytes required`);

@Injectable()
export class ValidFreeSpace implements PipeTransform {
  constructor(@Inject(REQUEST) protected readonly request: Request) {}
  transform(file: Express.Multer.File) {
    const freeSpace = 10000; // 10MB
    const value = file.size;
    if (value > freeSpace) throw NotEnoughFreeSpace(freeSpace);
    return file;
  }
}
