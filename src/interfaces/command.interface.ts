import { Type } from '@nestjs/common';
import { CommandOptions } from './command-options.interface';
import { CommandHandler } from './command-handler.interface';
import {
  CommandArgsCollection,
  CommandOptionsCollection,
} from '../collections';

export interface Command extends CommandOptions {
  instance: CommandHandler;
  target: Type<CommandHandler>;
  options: CommandOptionsCollection;
  args: CommandArgsCollection;
}
