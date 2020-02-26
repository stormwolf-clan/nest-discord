import { ErrorHandler, ValidateHandler } from './types';

export interface OptionOptions<T = Record<string, any>, V = string> {
  // default is property name
  name?: string;
  // default is property initializer
  default?: string | number;
  description?: string;
  aliases?: string[];
  validate?: ValidateHandler<T, V>;
  error?: ErrorHandler<T, V>;
}
