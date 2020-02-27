import { Observable } from 'rxjs';
import { Message } from 'discord.js';

export type Mention = 'channels' | 'users' | 'roles' | 'members';
export type Asyncable<V = any> = Observable<V> | Promise<V> | V;

export type TransformHandler<T, V> = (this: T, value: string) => Asyncable<V>;
export type ErrorHandler<T = Record<any, string>, V = any> =
  | string
  | ((this: T, message: Message, value: V) => Asyncable<string>);
export type ValidateHandler<T, V> = (
  this: T,
  message: Message,
  value: V,
) => Asyncable<boolean>;
