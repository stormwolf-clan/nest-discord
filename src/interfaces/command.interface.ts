import { CommandOptions } from './command-options.interface';
import { CommandExecute } from './command-execute.interface';

export interface Command extends CommandOptions {
  instance: CommandExecute;
}
