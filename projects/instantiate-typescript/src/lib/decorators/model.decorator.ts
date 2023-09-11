import {
  AbstractionMapperConstructor,
  EmptyConstructor,
  MapModelDescriptorType,
} from '../types';
import 'reflect-metadata';

export const INSTANTIATE_REFLECT_PROPERTY_KEY =
  'INSTANTIATE_REFLECT_PROPERTY_KEY';
export const INSTANTIATE_CLASS_MAPPER_KEY = 'INSTANTIATE_CLASS_MAPPER_KEY';

/**
 * Decorates a property to provide type-meta-data
 * @param constructor
 * @returns
 */
export function MapModel<T extends object>(
  constructor: EmptyConstructor<T>
): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const descriptorValue: MapModelDescriptorType<T> = {
      constructor,
      mapperConstructor: null,
    };

    Reflect.defineMetadata(
      INSTANTIATE_REFLECT_PROPERTY_KEY,
      descriptorValue,
      target,
      propertyKey
    );
  };
}

/**
 * Decorates a property to provide type-meta-data
 * @param constructor
 * @returns
 */
export function MapAbstractModel<T extends object>(
  mapperConstructor: AbstractionMapperConstructor<T>
): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const descriptorValue: MapModelDescriptorType<T> = {
      constructor: null,
      mapperConstructor: mapperConstructor,
    };

    Reflect.defineMetadata(
      INSTANTIATE_REFLECT_PROPERTY_KEY,
      descriptorValue,
      target,
      propertyKey
    );
  };
}
