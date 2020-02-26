import { Observable } from 'rxjs';
import { Message } from 'discord.js';

export type Mention = 'channels' | 'users' | 'roles' | 'members';

export type Asyncable<V = any> = Observable<V> | Promise<V> | V;
export type ErrorHandler<T, V> =
  | string
  | ((this: T, message: Message, value: V) => Asyncable<string>);
export type ValidateHandler<T, V> = (
  this: T,
  message: Message,
  value: V,
) => Asyncable<boolean>;
