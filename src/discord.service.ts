import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as Discord from 'discord.js';
import * as minimist from 'minimist';

import { MODULE_OPTIONS } from './tokens';
import {
  ArgOptions,
  Command,
  CommandHandler,
  DiscordModuleOptions,
} from './interfaces';
import { CommandsExplorerService } from './services';
import {
  CommandsCollection,
  CooldownsCollection,
  TimestampsCollection,
} from './collections';
import { MessageMentions } from 'discord.js';
import { Mention } from './interfaces/types';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly client = new Discord.Client();
  private readonly commands = new CommandsCollection();
  private readonly cooldowns = new CooldownsCollection();
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly commandsExplorer: CommandsExplorerService,
    private readonly moduleRef: ModuleRef,
    @Inject(MODULE_OPTIONS)
    private readonly options: DiscordModuleOptions,
  ) {}

  private async validateOptions(
    message: Discord.Message,
    command: Command,
    options: Record<string, string>,
  ): Promise<void> {
    Object.keys(options).forEach(name => {
      if (!(name in command.options)) {
      }
    });
  }

  private async validateArgs(
    message: Discord.Message,
    command: Command,
    args: string[],
  ): Promise<void> {
    const commandArgsEntries = Object.entries(command.args);
    const userMentionRegex = /<@!(.*?)>/;
    args.forEach((argValue, i) => {
      const [propertyKey, arg]: [string, ArgOptions] = commandArgsEntries[i];
      if (arg.mentions?.length) {
        const id = userMentionRegex.exec(argValue)![1];
        const allMentions = arg.mentions.reduce(
          (mentions, mention) => [
            ...message.mentions[mention].values(),
            ...mentions,
          ],
          [] as any[],
        );
        command.instance[propertyKey] = allMentions.find(
          mention => mention.id === id,
        );
      }
    });
  }

  private getCommand(name: string): Command | null {
    return (
      this.commands.get(name) ||
      this.commands.find(command => !!command.aliases?.includes(name))
    );
  }

  // TODO: It shouldn't resolve until the Discord client is authorized **AND** ready
  async onModuleInit(): Promise<void> {
    try {
      const commands = this.commandsExplorer.explore();
      commands.forEach(command => {
        this.commands.set(command.name, command);

        if (command.cooldown != null) {
          this.cooldowns.set(command.name, new TimestampsCollection());
        }
      });

      const { token, commandPrefix } = this.options;

      this.client.once('ready', () => this.logger.log('Ready'));

      this.client.on('message', async message => {
        if (!message.content.startsWith(commandPrefix!) || message.author.bot)
          return;

        const args = minimist(
          message.content.slice(commandPrefix.length).split(' '),
        );
        const commandName = args._.shift()!.toLowerCase();
        const command = this.getCommand(commandName);
        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text') {
          return message.reply(`I can't execute that command inside DMs!`);
        }

        // TODO: Validate options / args
        /*if (!args.length) {
          let reply = `You didn't provide any arguments, ${message.author}!`;

          if (command.usage) {
            reply += `\nThe proper usage would be: \`${commandPrefix}${command.name} ${command.usage}\``;
          }

          return message.channel.send(reply);
        }*/

        if (this.cooldowns.has(command.name)) {
          const now = Date.now();
          const timestamps = this.cooldowns.get(command.name)!;
          const cooldownAmount = command.cooldown! * 1000;

          if (timestamps.has(message.author.id)) {
            const expirationTime =
              timestamps.get(message.author.id)! + cooldownAmount;

            if (now < expirationTime) {
              const timeLeft = (expirationTime - now) / 1000;
              return message.reply(
                `Please wait ${timeLeft.toFixed(
                  1,
                )} more second(s) before reusing the \`${
                  command.name
                }\` command.`,
              );
            }
          }

          timestamps.set(message.author.id, now);
          setTimeout(
            () => timestamps.delete(message.author.id),
            cooldownAmount,
          );
        }

        try {
          command.instance = await this.moduleRef.create(command.target);
          const commandArgs = args._.filter(arg => arg !== '');
          delete args._;
          const commandOptions = args;

          await Promise.all([
            this.validateArgs(message, command, commandArgs),
            this.validateOptions(message, command, commandOptions),
          ]);

          return command.instance.handle(message);
        } catch (err) {
          this.logger.error(err);
          return message.reply(
            'There was an error trying to execute that command!',
          );
        }
      });

      await this.client.login(token);
      this.logger.log('Authorized');
    } catch (err) {
      this.logger.error(err.message);
      delete err.message;
      throw err;
    }
  }
}
