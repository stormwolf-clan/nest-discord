import { Instance, OptionOptions } from '../interfaces';
import { COMMAND_OPTION_OPTIONS } from '../tokens';
import { CommandOptionsCollection } from '../collections';

export function Option(name?: string): PropertyDecorator;
export function Option(options?: OptionOptions): PropertyDecorator;
export function Option(options: string | OptionOptions = {}) {
  return (target: Instance, propertyKey: string) => {
    if (typeof options === 'string') {
      options = { name: options };
    } else if (!options.name) {
      options.name = propertyKey;
    }

    if (options.name === 'help') {
      throw new Error(`Option cannot be named "help" as its reserved!`);
    }
    options.type = Reflect.getMetadata('design:type', target, propertyKey);

    let commandOptions = Reflect.getMetadata(
      COMMAND_OPTION_OPTIONS,
      target.constructor,
    );
    if (!commandOptions) {
      commandOptions = new CommandOptionsCollection();
      Reflect.defineMetadata(
        COMMAND_OPTION_OPTIONS,
        commandOptions,
        target.constructor,
      );
    }

    commandOptions.set(propertyKey, options);

    /*const commandOptions = Reflect.getMetadata(COMMAND_OPTION_OPTIONS, target.constructor) || new CommandOptionsCollection();

    Reflect.defineMetadata(
      COMMAND_OPTION_OPTIONS,
      {
        ...commandOptions,
        [propertyKey]: options,
      },
      target.constructor,
    );*/
  };
}
