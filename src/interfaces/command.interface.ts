import { Type } from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';
import { CommandOptions } from './command-options.interface';
import { CommandHandler, Instance } from './types';
import {
  CommandArgsCollection,
  CommandOptionsCollection,
} from '../collections';

export interface Command extends CommandOptions {
  module: Module;
  handle: CommandHandler;
  instance: Instance;
  target: Type<Instance>;
  options: CommandOptionsCollection;
  args: CommandArgsCollection;
}
