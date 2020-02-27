import * as Discord from 'discord.js';

import { ArgOptions, Command, OptionOptions } from './interfaces';

export class CommandsCollection extends Discord.Collection<string, Command> {}

export class CommandOptionsCollection extends Discord.Collection<
  string,
  OptionOptions
> {}

export class CommandArgsCollection extends Discord.Collection<
  string,
  ArgOptions
> {}

export class TimestampsCollection extends Discord.Collection<string, number> {}

export class CooldownsCollection extends Discord.Collection<
  string,
  TimestampsCollection
> {}
