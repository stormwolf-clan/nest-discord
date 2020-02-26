import { DynamicModule, Module } from '@nestjs/common';

import { DiscordModuleOptions } from './interfaces';
import { MODULE_OPTIONS } from './tokens';
import { CommandsExplorerService } from './services';
import { DiscordService } from './discord.service';

@Module({})
export class DiscordModule {
  static forRoot(options: DiscordModuleOptions): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        DiscordService,
        CommandsExplorerService,
        {
          provide: MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
