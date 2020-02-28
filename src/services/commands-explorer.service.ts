import { Injectable } from '@nestjs/common';
import { flattenDeep, identity } from 'lodash';
import { ModulesContainer } from '@nestjs/core';

import { Command, CommandHandler, Instance } from '../interfaces';
import { CommandOptionsCollection } from '../collections';
import {
  COMMAND_ARG_OPTIONS,
  COMMAND_HANDLER_METHOD,
  COMMAND_OPTION_OPTIONS,
  COMMAND_OPTIONS,
} from '../tokens';

@Injectable()
export class CommandsExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  getCommandOptions(instance: Instance): CommandOptionsCollection {
    return Reflect.getMetadata(COMMAND_OPTION_OPTIONS, instance.constructor);
  }

  getCommandArgs(instance: Instance): CommandOptionsCollection {
    return Reflect.getMetadata(COMMAND_ARG_OPTIONS, instance.constructor);
  }

  getCommandHandler(instance: Record<string, any>): CommandHandler {
    return Reflect.getMetadata(COMMAND_HANDLER_METHOD, instance.constructor);
  }

  explore(): Command[] {
    const modules = [...this.modulesContainer.values()];

    return flattenDeep(
      modules.map(module =>
        [...module.providers.values()].map(
          ({ instance }: { instance: Instance }) => {
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
                handle: this.getCommandHandler(instance),
                module,
                ...options,
              };
            }
          },
        ),
      ),
    ).filter(identity) as Command[];
  }
}
