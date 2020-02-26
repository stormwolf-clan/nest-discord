import { Injectable } from '@nestjs/common';
import { flattenDeep, identity } from 'lodash';
import { ModulesContainer } from '@nestjs/core';

import { COMMAND_OPTIONS_METADATA } from '../tokens';
import { Command } from '../interfaces';

@Injectable()
export class CommandsExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  explore(): Command[] {
    const modules = [...this.modulesContainer.values()];

    return flattenDeep(
      modules.map(module =>
        [...module.providers.values()].map(wrapper => {
          const instance = wrapper.metatype?.prototype;
          if (!instance) return;

          const options = Reflect.getMetadata(
            COMMAND_OPTIONS_METADATA,
            instance.constructor,
          );

          if (options) {
            return {
              instance,
              ...options,
            };
          }
        }),
      ),
    ).filter(identity) as Command[];
  }
}
