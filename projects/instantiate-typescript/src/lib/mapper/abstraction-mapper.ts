import { EmptyConstructor, Nothing } from '../types';

export abstract class AbstractionMapper<T extends Object> {
  abstract getConstructor(from: Partial<T> | Nothing): EmptyConstructor<T>;
}
