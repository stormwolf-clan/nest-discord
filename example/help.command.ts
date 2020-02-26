import { Command } from '../src/decorators';

@Command({
  name: 'help',
  description: 'Display help message',
})
export class HelpCommand {}
