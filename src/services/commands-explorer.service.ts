import { Injectable } from '@nestjs/common';
import { flattenDeep, identity } from 'lodash';
import { ModulesContainer } from '@nestjs/core';

import {
  COMMAND_ARG_OPTIONS,
  COMMAND_OPTION_OPTIONS,
  COMMAND_OPTIONS,
} from '../tokens';
import { Args, Command, Options } from '../interfaces';

@Injectable()
export class CommandsExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  getCommandOptions(instance: Record<string, any>): Options {
    return Reflect.getMetadata(COMMAND_OPTION_OPTIONS, instance.constructor);
  }

  getCommandArgs(instance: Record<string, any>): Args {
    return Reflect.getMetadata(COMMAND_ARG_OPTIONS, instance.constructor);
  }

  explore(): Command[] {
    const modules = [...this.modulesContainer.values()];

    return flattenDeep(
      modules.map(module =>
        [...module.providers.values()].map(({ instance }) => {
          if (!instance) return;

          const options = Reflect.getMetadata(
            COMMAND_OPTIONS,
            instance.constructor,
          );

          if (options) {
            return {
              target: instance.constructor,
              options: this.getCommandOptions(instance),
              args: this.getCommandArgs(instance),
              ...options,
            };
          }
        }),
      ),
    ).filter(identity) as Command[];
  }
}
