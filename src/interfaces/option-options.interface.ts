import { ErrorHandler, TransformHandler, ValidateHandler } from './types';

export interface OptionOptions<T = Record<string, any>, V = string> {
  name?: string;
  type?: any;
  description?: string;
  aliases?: string[];
  transform?: TransformHandler<T, V>;
  validate?: ValidateHandler<T, V>;
  error?: ErrorHandler<T, V>;
}
