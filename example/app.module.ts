import { Global, Module } from '@nestjs/common';
import { DiscordModule } from '../src';

import { HelpCommand } from './help.command';
import { TestService } from './test.service';

@Module({
  providers: [TestService],
  exports: [TestService],
})
class TestModule {}

@Module({
  imports: [TestModule],
  providers: [HelpCommand],
})
class CommandsModule {}

@Module({
  imports: [
    DiscordModule.forRoot({
      token: process.env.DISCORD_TOKEN!,
      commandPrefix: '!',
    }),
    TestModule,
    CommandsModule,
  ],
})
export class AppModule {}
