import { ErrorHandler, Mention, ValidateHandler } from './types';

export interface ArgOptions<T = Record<string, any>, V = string> {
  // default is property name
  name?: string;
  mentions?: Mention[];
  // Is argument a tagged user
  // Rest of args
  multi?: boolean;
  // default is property initializer
  required?: boolean;
  default?: string | number;
  description?: string;
  validate?: ValidateHandler<T, V>;
  error?: ErrorHandler<T, V>;
}
