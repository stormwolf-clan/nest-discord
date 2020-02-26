import { Injectable, SetMetadata } from '@nestjs/common';

import { CommandOptions } from '../interfaces';
import { COMMAND_OPTIONS } from '../tokens';

export function Command(options: CommandOptions): ClassDecorator {
  return (target: Function): void => {
    SetMetadata(COMMAND_OPTIONS, options)(target);
    Injectable()(target);
  };
}
