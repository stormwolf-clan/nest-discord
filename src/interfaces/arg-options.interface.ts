import { Observable } from 'rxjs';

export interface ArgOptions<T = any, V = string> {
  name?: string;
  description?: string;
  validate?(this: T, value: V): Observable<boolean> | Promise<boolean> | boolean;
}
