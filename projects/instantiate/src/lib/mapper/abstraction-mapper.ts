import { EmptyConstructor } from '../types';

export abstract class AbstractionMapper<T extends Object> {
  abstract getConstructor(from: Partial<T>): EmptyConstructor<T>;
}
