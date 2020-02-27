import { Observable } from 'rxjs';

export async function toPromise<V>(
  value: Observable<V> | Promise<V> | V,
): Promise<V> {
  return value instanceof Observable ? value.toPromise() : value;
}

export function pad(str: string, width: number): string {
  const len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}
