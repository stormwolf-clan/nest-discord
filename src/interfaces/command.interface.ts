import { Type } from '@nestjs/common';
import { CommandOptions } from './command-options.interface';
import { CommandHandler } from './command-handler.interface';
import { ArgOptions } from './arg-options.interface';
import { OptionOptions } from './option-options.interface';

export type Options = Record<string, OptionOptions>;
export type Args = Record<string, ArgOptions>;

export interface Command extends CommandOptions {
  instance: CommandHandler;
  target: Type<CommandHandler>;
  options: Options[];
  args: Args[];
}
