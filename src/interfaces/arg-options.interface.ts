import {
  ErrorHandler,
  Instance,
  Mention,
  TransformHandler,
  ValidateHandler,
} from './types';

export interface ArgOptions<T = Instance, V = string> {
  name?: string;
  mentions?: Mention[];
  multi?: boolean;
  required?: boolean;
  description?: string;
  type?: any;
  transform?: TransformHandler<T, V>;
  validate?: ValidateHandler<T, V>;
  error?: ErrorHandler<T, V>;
}
