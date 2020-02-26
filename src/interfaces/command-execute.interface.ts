import { Message } from 'discord.js';
import { Observable } from 'rxjs';

export interface CommandExecute {
  execute(message: Message): Observable<void> | Promise<void> | void;
}
