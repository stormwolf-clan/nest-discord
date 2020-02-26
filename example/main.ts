import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

(async () => {
  const bot = await NestFactory.createApplicationContext(AppModule);
  await bot.init();
})();
