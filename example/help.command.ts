import { Discord, Arg, Command, Option, Handle } from '../src';
import { TestService } from './test.service';

//
@Command({
  name: 'test',
  description: 'Display help message',
})
export class HelpCommand {
  @Arg({
    mentions: ['users'],
  })
  user: Discord.User;

  @Arg()
  second: boolean;

  @Option({
    description: 'Test',
  })
  one: string;

  constructor(private readonly test: TestService) {}

  @Handle()
  handle(message: Discord.Message): void {
    console.log(this);
  }
}
