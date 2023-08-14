import { map } from 'rxjs';
import { AbstractionMapperConstructor, EmptyConstructor } from '../types';
import { parsePartialToRealObject } from '../parser/parser';
import { factory } from '../helpers/creator';

export function MapObservable<T extends Object>(
  constructor: EmptyConstructor<T>
) {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => decorate(constructor, null, descriptor);
}

export function MapAbstractObservable<T extends Object>(
  mapperConstructor: AbstractionMapperConstructor<T>
) {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => decorate(null, mapperConstructor, descriptor);
}

function decorate<T extends Object>(
  constructor: EmptyConstructor<T> | null,
  mapperConstructor: AbstractionMapperConstructor<T> | null,
  descriptor: TypedPropertyDescriptor<any>
): TypedPropertyDescriptor<any> {
  // copy the original method into a local variable for reassignment.
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    return originalMethod.apply(this).pipe(
      map((object) => {
        if (object != null) {
          if (mapperConstructor != null) {
            constructor = new mapperConstructor().getConstructor(object);
          }
          console.assert(
            constructor != null,
            'Constructor should not be null. This is an internal function and is a software error.'
          );
          return parsePartialToRealObject(constructor!, object);
        }
        return object;
      })
    );
  };

  return descriptor;
}
