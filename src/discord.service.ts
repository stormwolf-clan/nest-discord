import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as Discord from 'discord.js';
import * as minimist from 'minimist';

import { CommandsExplorerService } from './services';
import { USER_MENTION_REGEX } from './constants';
import { MODULE_OPTIONS } from './tokens';
import { toPromise } from './utils';
import { ValidationError } from './errors';
import {
  ArgOptions,
  Command,
  DiscordModuleOptions,
  ErrorHandler,
  Instance,
  OptionOptions,
  TransformHandler,
  ValidateHandler,
} from './interfaces';
import {
  CommandsCollection,
  CooldownsCollection,
  TimestampsCollection,
} from './collections';

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

  private async transformValue(
    instance: Instance,
    propertyKey: string,
    type: Function,
    value: any,
    transform?: TransformHandler<any, any>,
  ): Promise<void> {
    if (type === Boolean && (value === 'true' || value === 'false')) {
      instance[propertyKey] = Boolean(value);
    }
    /*if (type.name === 'Boolean') {
      if (value === 'true' || value === 'false') {
        instance[propertyKey] = Boolean(value);
      } else {
        // Should be moved to validation
        throw new Error(`Whatever value ${value} isn't a valid boolean`);
      }
    }*/

    if (type === Number && value != null) {
      instance[propertyKey] = Number(value);
      /*if (Number.isNaN(instance[propertyKey])) {
        throw new Error(`Whatever value ${value} isn't a valid number`);
      }*/
    }

    instance[propertyKey] = transform
      ? await toPromise(transform.bind(instance)(value))
      : value;
  }

  private async validateValue(
    instance: Instance,
    propertyKey: string,
    type: Function,
    validate?: ValidateHandler<any, any>,
    error?: ErrorHandler<any, any>,
  ): Promise<void> {
    return undefined;
  }

  /*private async validateValue(
    instance: Instance,
    propertyKey: string,
    type: Function,
    validate?: ValidateHandler<any, any>,
    error?: ErrorHandler<any, any>,
  ): Promise<void> {}*/

  private async processOptions(
    message: Discord.Message,
    command: Command,
    options: Record<string, string>,
  ): Promise<void> {
    Object.keys(options).forEach(name => {
      if (!(name in command.options)) {
      }
    });
  }

  private async transformArgs(
    message: Discord.Message,
    instance: Command['instance'],
    commandArgs: [string, ArgOptions][],
    userArgs: string[],
  ) {
    await Promise.all(
      userArgs.map(async (argValue, i) => {
        const [propertyKey, arg] = commandArgs[i];

        if (arg.mentions?.length) {
          if (arg.transform) {
            throw new Error(
              `Cannot transform mentions on ${arg.name} argument`,
            );
          }

          // TODO: Pass to validation
          const id = USER_MENTION_REGEX.exec(argValue);
          if (id) {
            const allMentions = arg.mentions.reduce(
              (mentions, mention) => [
                ...message.mentions[mention].values(),
                ...mentions,
              ],
              [] as Array<{ id: string }>,
            );

            instance[propertyKey] = allMentions.find(
              mention => mention.id === id[1],
            );
          }
        } else {
          await this.transformValue(
            instance,
            propertyKey,
            arg.type,
            argValue,
            arg.transform,
          );
        }
      }),
    );
  }

  private async throwValidationError(
    instance: Command['instance'],
    handler: ErrorHandler | undefined,
    message: Discord.Message,
    value: any,
    defaultError = `Whatever value ${value} isn't valid`,
  ): Promise<void> {
    const error =
      typeof handler === 'function'
        ? await toPromise(handler.bind(instance)(message, value))
        : handler;

    throw new ValidationError(error || defaultError);
  }

  // Should return error messages
  private async validateArgs(
    message: Discord.Message,
    instance: Command['instance'],
    commandArgs: [string, ArgOptions][],
    userArgs: string[],
  ) {
    if (userArgs.length !== commandArgs.length) {
      // TODO: Display which arguments are missing or excessive
      throw new ValidationError('Invalid amount of arguments');
    }

    await Promise.all(
      userArgs.map(async (argValue, i) => {
        const [propertyKey, arg]: [string, ArgOptions] = commandArgs[i];
        const value = instance[propertyKey];

        if (typeof arg.validate === 'function') {
          const valid = await toPromise(arg.validate(message, value));
          // BREAK
          if (valid) return;

          await this.throwValidationError(instance, arg.error, message, value);
        }

        if (arg.type === Boolean) {
          // BREAK
          if (typeof value === 'boolean') return;

          throw new ValidationError(
            `Whatever value ${value} isn't a valid boolean`,
          );
        }

        if (arg.type === String) {
          // BREAK
          if (typeof value === 'string') return;

          throw new ValidationError(`Whatever value ${value} isn't a string`);
        }
        if (typeof arg.type !== 'object' && !(value instanceof arg.type)) {
          await this.throwValidationError(instance, arg.error, message, value);
        }
      }),
    );
  }

  private async processArgs(
    message: Discord.Message,
    command: Command,
    args: string[],
  ): Promise<void> {
    const commandArgs = [...command.args.entries()];

    await this.transformArgs(message, command.instance, commandArgs, args);
    await this.validateArgs(message, command.instance, commandArgs, args);
  }

  private getCommandOptions(
    command: Command,
    name: string,
  ): OptionOptions | undefined {
    return Object.values(command.options).find(
      option => option.name === name || option.aliases?.includes(name),
    );
  }

  private getCommand(name: string): Command | undefined {
    return (
      this.commands.get(name) ||
      this.commands.find(command => !!command.aliases?.includes(name))
    );
  }

  // TODO
  private displayCommandUsage(
    message: Discord.Message,
    command: Command,
  ): Promise<Discord.Message | Discord.Message[]> {
    let usage = `Usage: ${command.name}`;

    const argValues = Object.values(command.args);
    if (argValues.length) {
      usage += `
Arguments:
      `;
    }

    const optionValues = Object.values(command.options);
    if (optionValues.length) {
      usage += `

Options:
      `;

      optionValues.forEach(option => {
        const flags = [...option.aliases!, option.name]
          .map(name => `--${name}`)
          .join(', ');
        usage += '  ' + flags;
      });
    }

    return message.reply(usage);
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
          return message.reply(
            `I can't execute that command in private messages!`,
          );
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
          // @ts-ignore
          command.instance = await this.moduleRef.instantiateClass(
            command.target,
            command.module,
          );
          const commandArgs = args._.filter(arg => arg !== '');
          delete args._;
          const commandOptions = args;

          if (commandName === 'help') {
            return this.displayCommandUsage(message, command);
          }

          await Promise.all([
            this.processArgs(message, command, commandArgs),
            this.processOptions(message, command, commandOptions),
          ]);

          return toPromise(command.handle.bind(command.instance)(message));
        } catch (err) {
          if (err instanceof ValidationError) {
            return message.reply(err.message);
          }

          console.error(err);
          return message.reply(
            'There was an error trying to execute that command: ' + err.message,
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
