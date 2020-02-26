import { ArgOptions } from '../interfaces';
import { COMMAND_ARG_OPTIONS } from '../tokens';

export function Arg(name?: string): PropertyDecorator;
export function Arg(options?: ArgOptions): PropertyDecorator;
export function Arg(options: string | ArgOptions = {}) {
  return (target: Record<string, any>, propertyKey: string) => {
    if (typeof options === 'string') {
      options = { name: options };
    } else if (!options.name) {
      options.name = propertyKey;
    }

    if (options.name === 'help') {
      throw new Error(`Arg cannot be named "help" as its reserved!`);
    }

    const commandArgs =
      Reflect.getMetadata(COMMAND_ARG_OPTIONS, target.constructor) || {};

    Reflect.defineMetadata(
      COMMAND_ARG_OPTIONS,
      {
        ...commandArgs,
        [propertyKey]: options,
      },
      target.constructor,
    );
  };
}
