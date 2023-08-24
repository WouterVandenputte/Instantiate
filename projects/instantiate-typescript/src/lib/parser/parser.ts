import {
  AbstractionMapperConstructor as AbstractionMapperConstructor,
  EmptyConstructor,
  MapModelDescriptorType,
  Nothing,
} from '../types';
import { INSTANTIATE_REFLECT_PROPERTY_KEY } from '../decorators/model.decorator';
import 'reflect-metadata';
import { factory } from '../helpers/creator';

/**
 * Maps a raw JS object to a TS class instance with nested properties iff they have been decorated accordignly.
 * If the `partial` is an array, each child will be mapped instead.
 * @param constructor
 * @param partial
 * @returns
 */
export function parsePartialToRealObject<T extends Object>(
  constructor: EmptyConstructor<T>,
  partial: Partial<T> | Partial<T>[] | Nothing
): T | Nothing {
  if (!partial) return null;

  if (Array.isArray(partial))
    return parseArray(constructor, [], partial) as unknown as T;
  return parseObject(factory(constructor), partial);
}

function parseObject<T extends Object>(
  returnValueObject: T,
  partialModel: Partial<T>
): T {
  for (const key of keys(returnValueObject)) {
    const propertyDescriptorValue = Reflect.getMetadata(
      INSTANTIATE_REFLECT_PROPERTY_KEY,
      returnValueObject,
      key
    ) as MapModelDescriptorType<object> | null;

    try {
      if (propertyDescriptorValue) {
        // Then we map
        const subConstructor =
          propertyDescriptorValue.constructor ??
          new propertyDescriptorValue.mapperConstructor!()?.getConstructor(
            partialModel
          );

        if (subConstructor) {
          if (partialModel[key]) {
            const subPartialValue = partialModel[key] as
              | Partial<T>
              | Partial<T>[];

            // Needs refactoring.
            returnValueObject[key] = parsePartialToRealObject<any>(
              subConstructor,
              subPartialValue
            );

            // if (Array.isArray(subPartialValue)) {
            //   returnValueObject[key] = subPartialValue.map(
            //     (x) => parsePartialToRealObject(subConstructor, x) as T
            //   );
            // } else if (typeof subPartialValue === 'object') {
            //   returnValueObject[key] = parsePartialToRealObject(
            //     subConstructor,
            //     partialModel[key] as Partial<T>
            //   );
            // } else {
            //   throw Error(
            //     'A primitive type was given yet decorated with a class'
            //   );
            // }
          }
        } else {
          throw Error('Internal error. Uncaptured constructor type');
        }
      } else {
        returnValueObject[key] = partialModel[key] as any;
      }
    } catch (e) {
      console.warn(
        'Due to an internal error, one or more objects could not be instantiated to Typescript classes and will be kept as raw JS objects'
      );
    }
  }

  return returnValueObject as T;
}

function parseArray<T extends Object>(
  constructor: EmptyConstructor<T>,
  returnObject: T[],
  partialModel: Partial<T>[]
): T[] {
  for (let i = 0; i < partialModel.length; i++) {
    returnObject[i] = parsePartialToRealObject(
      constructor,
      partialModel[i] as Partial<T>
    ) as T;
  }

  return returnObject;
}

export function parseAbstraction<T extends Object>(
  mapper: AbstractionMapperConstructor<T>,
  partial: Partial<T>
): T {
  return parsePartialToRealObject(
    new mapper().getConstructor(partial),
    partial
  ) as T;
}

function keys<T extends Object>(object: T): (keyof T & string)[] {
  return Object.keys(object) as (keyof T & string)[];
}
