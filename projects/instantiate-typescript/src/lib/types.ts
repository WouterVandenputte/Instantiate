import { AbstractionMapper } from './mapper/abstraction-mapper';

export declare type EmptyConstructor<T> = new () => T;
export declare type EmptyAbstractConstructor<T> = abstract new () => T;
export declare type AbstractionMapperConstructor<T extends object> =
  new () => AbstractionMapper<T>;
export declare type Nothing = null | undefined;

export declare type MapModelDescriptorType<T extends object> = {
  constructor: EmptyConstructor<T> | Nothing;
  mapperConstructor: AbstractionMapperConstructor<T> | Nothing;
  isDate?: boolean;
};
