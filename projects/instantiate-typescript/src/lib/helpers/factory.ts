import { EmptyConstructor } from '../types';

export function factory<T>(Ctor: EmptyConstructor<T>) {
  return new Ctor();
}
