import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as Discord from 'discord.js';
import { bindCallback } from 'rxjs';

import { MODULE_OPTIONS } from './tokens';
import { Command, DiscordModuleOptions } from './interfaces';
import { CommandsExplorerService } from './services';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly client = new Discord.Client();
  private readonly commands = new Discord.Collection<string, Command>();

  constructor(
    private readonly commandsExplorer: CommandsExplorerService,
    @Inject(MODULE_OPTIONS)
    private readonly options: DiscordModuleOptions,
  ) {}

  private getCommand(name: string): Command | null {
    return this.commands.get(name) ||
      this.commands.find(command => !!command.aliases?.includes(name));
  }

  async onModuleInit(): Promise<void> {
    const commands = this.commandsExplorer.explore();
    commands.forEach(command => this.commands.set(command.name, command));

    const { token, commandPrefix } = this.options;
    await this.client.login(token);
    await bindCallback(this.client.once)('once').toPromise();


    this.client.on('message', message => {
      if (!message.content.startsWith(commandPrefix!) || message.author.bot) return;

      const args = message.content.slice(commandPrefix.length).split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      const command = this.getCommand(commandName!);

      if (!command) return;

      if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply(`I can't execute that command inside DMs!`);
      }

      if (!args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
          reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
      }
    });
  }
}
