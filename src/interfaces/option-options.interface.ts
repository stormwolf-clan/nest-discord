import {
  ErrorHandler,
  Instance,
  TransformHandler,
  ValidateHandler,
} from './types';

export interface OptionOptions<T = Instance, V = string> {
  name?: string;
  type?: any;
  description?: string;
  aliases?: string[];
  transform?: TransformHandler<T, V>;
  validate?: ValidateHandler<T, V>;
  error?: ErrorHandler<T, V>;
}
