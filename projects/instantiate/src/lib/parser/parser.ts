import {
  AbstractionMapperConstructor as AbstractionMapperConstructor,
  EmptyConstructor,
  MapModelDescriptorType,
  ModelObject,
} from '../types';
import { INSTANTIATE_REFLECT_PROPERTY_KEY } from '../decorators/model.decorator';
import 'reflect-metadata';
import { factory } from '../helpers/creator';

/**
 * Maps a raw JS object to a TS class instance with nested properties iff they have been decorated accordignly
 * @param constructor
 * @param partial
 * @returns
 */
export function parsePartialToRealObject<T extends Object>(
  constructor: EmptyConstructor<T>,
  partial: Partial<T>
): T {
  const returnValueObject = factory(constructor) as ModelObject;
  const partialModel = partial as ModelObject;

  for (const key of Object.keys(returnValueObject)) {
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
            const subPartialValue = partialModel[key];

            if (Array.isArray(subPartialValue)) {
              returnValueObject[key] = subPartialValue.map((x) =>
                parsePartialToRealObject(subConstructor, x)
              );
            } else if (typeof subPartialValue === 'object') {
              returnValueObject[key] = parsePartialToRealObject(
                subConstructor,
                partialModel[key] as Partial<T>
              );
            } else {
              throw Error(
                'A primitive type was given yet decorated with a class'
              );
            }
          }
        } else {
          throw Error('Internal error. Uncaptured constructor type');
        }
      } else {
        returnValueObject[key] = partialModel[key];
      }
    } catch (e) {
      console.warn(
        'Due to an internal error, one or more objects could not be instantiated to Typescript classes and will be kept as raw JS objects'
      );
    }
  }

  return returnValueObject as T;
}

export function parseAbstraction<T extends Object>(
  mapper: AbstractionMapperConstructor<T>,
  partial: Partial<T>
): T {
  return parsePartialToRealObject(
    new mapper().getConstructor(partial),
    partial
  );
}
