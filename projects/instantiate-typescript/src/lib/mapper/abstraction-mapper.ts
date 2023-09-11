import { EmptyConstructor, Nothing } from '../types';

export abstract class AbstractionMapper<T extends object> {
  abstract getConstructor(from: Partial<T> | Nothing): EmptyConstructor<T>;
}
