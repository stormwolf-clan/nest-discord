import { COMMAND_HANDLER_METHOD } from '../tokens';
import { Instance } from '../interfaces';

export function Handle() {
  return (target: Instance, methodName: string) => {
    Reflect.defineMetadata(
      COMMAND_HANDLER_METHOD,
      target[methodName],
      target.constructor,
    );
  };
}
