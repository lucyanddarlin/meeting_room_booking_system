import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(err: string) {
    super(err, HttpStatus.BAD_REQUEST);
  }
}
