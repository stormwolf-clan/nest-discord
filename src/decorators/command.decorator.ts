import { Injectable, Scope, SetMetadata } from '@nestjs/common';

import { CommandOptions } from '../interfaces';
import { COMMAND_OPTIONS } from '../tokens';

export function Command(options: CommandOptions): ClassDecorator {
  return (target: Function): void => {
    if (options.name === 'help') {
      throw new Error(`Command cannot be named "help" as its reserved!`);
    }

    SetMetadata(COMMAND_OPTIONS, options)(target);
    Injectable(/*{ scope: Scope.TRANSIENT }*/)(target);
  };
}
