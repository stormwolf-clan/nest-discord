import { OptionOptions } from '../interfaces';
import { COMMAND_OPTION_OPTIONS } from '../tokens';

export function Option(name?: string): PropertyDecorator;
export function Option(options?: OptionOptions): PropertyDecorator;
export function Option(options: string | OptionOptions = {}) {
  return (target: Record<string, any>, propertyKey: string) => {
    if (typeof options === 'string') {
      options = { name: options };
    } else if (!options.name) {
      options.name = propertyKey;
    }

    if (options.name === 'help') {
      throw new Error(`Option cannot be named "help" as its reserved!`);
    }

    options.type = Reflect.getMetadata('design:type', target, propertyKey);
    const commandOptions =
      Reflect.getMetadata(COMMAND_OPTION_OPTIONS, target.constructor) || {};

    Reflect.defineMetadata(
      COMMAND_OPTION_OPTIONS,
      {
        ...commandOptions,
        [propertyKey]: options,
      },
      target.constructor,
    );
  };
}
