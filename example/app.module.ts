import { Module } from '@nestjs/common';
import { DiscordModule } from '../src';

import { HelpCommand } from './help.command';

@Module({
  imports: [
    DiscordModule.forRoot({
      token: process.env.DISCORD_BOT_TOKEN!,
      commandPrefix: '!',
    }),
  ],
  providers: [HelpCommand],
})
export class AppModule {}
