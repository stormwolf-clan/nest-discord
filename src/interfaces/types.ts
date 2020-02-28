import { Observable } from 'rxjs';
import { Message } from 'discord.js';

export type Mention = 'channels' | 'users' | 'roles' | 'members';
export type Asyncable<V = any> = Observable<V> | Promise<V> | V;
export type Instance = Record<string, any>;

export type CommandHandler<T = Instance, V = any> = (
  this: T,
  message: Message,
) => Asyncable<V>;
export type TransformHandler<T = Instance, V = any> = (
  this: T,
  value: string,
) => Asyncable<V>;
export type ErrorHandler<T = Instance, V = any> =
  | string
  | ((this: T, message: Message, value: V) => Asyncable<string>);
export type ValidateHandler<T = Instance, V = any> = (
  this: T,
  message: Message,
  value: V,
) => Asyncable<boolean>;
