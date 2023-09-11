import {
  AbstractionMapperConstructor as AbstractionMapperConstructor,
  EmptyConstructor,
  MapModelDescriptorType,
  Nothing,
} from '../types';
import { INSTANTIATE_REFLECT_PROPERTY_KEY } from '../decorators/model.decorator';
import 'reflect-metadata';
import { factory } from '../helpers/factory';

/**
 * Maps a raw JS object to a TS class instance with nested properties iff they have been decorated accordignly.
 * If the `partial` is an array, each child will be mapped instead.
 * @param constructor
 * @param partial
 * @returns
 */
export function parsePartialToRealObject<T extends object>(
  constructor: EmptyConstructor<T>,
  partial: Partial<T> | Partial<T>[] | Nothing
): T | Nothing {
  if (!partial) return null;

  if (Array.isArray(partial))
    return parseArray(constructor, [], partial) as unknown as T;
  return parseObject(factory(constructor), partial);
}

function parseObject<T extends object>(
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

            returnValueObject[key] = parsePartialToRealObject<any>(
              subConstructor,
              subPartialValue
            );
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

function parseArray<T extends object>(
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

export function parseAbstraction<T extends object>(
  mapper: AbstractionMapperConstructor<T>,
  partial: Partial<T>
): T {
  return parsePartialToRealObject(
    new mapper().getConstructor(partial),
    partial
  ) as T;
}

function keys<T extends object>(object: T): (keyof T & string)[] {
  return Object.keys(object) as (keyof T & string)[];
}
