import * as Discord from 'discord.js';

import { Command } from './interfaces';

export class CommandsCollection extends Discord.Collection<string, Command> {}

export class TimestampsCollection extends Discord.Collection<string, number> {}

export class CooldownsCollection extends Discord.Collection<
  string,
  TimestampsCollection
> {}
