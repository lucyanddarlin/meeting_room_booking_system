import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { BaseExceptionsFilter } from './common/exceptions/base.exceptions.filter';
import { HttpExceptionsFilter } from './common/exceptions/http.exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启动 CORS
  app.enableCors();
  // 全局响应数据转换
  app.useGlobalInterceptors(new TransformInterceptor());
  // 全局错误处理
  app.useGlobalFilters(new BaseExceptionsFilter(), new HttpExceptionsFilter());
  // 全局 DTO 参数校验
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
