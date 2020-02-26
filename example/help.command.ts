import { Discord, Arg, Command, CommandHandler, Option } from '../src';

//
@Command({
  name: 'help',
  description: 'Display help message',
})
export class HelpCommand implements CommandHandler {
  @Arg({
    mentions: ['users'],
  })
  user: Discord.ClientUser;

  @Arg()
  second = 'test';

  @Option()
  one: string;

  handle(message: Discord.Message): void {
    console.log(this.user);
  }
}
