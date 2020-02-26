import * as Discord from 'discord.js';
import { Observable } from 'rxjs';

export interface CommandHandler {
  [propertyKey: string]: any;
  handle(message: Discord.Message): Observable<void> | Promise<void> | void;
}
