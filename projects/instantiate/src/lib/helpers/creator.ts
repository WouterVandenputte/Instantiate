import { EmptyConstructor, ModelObject } from '../types';

/**
 * Creates and fill an object within a single function.
 * @param constructor The type of the to be created object.
 * @param from A skeleton of fill values
 */
export function createObject<T extends ModelObject>(
  constructor: EmptyConstructor<T>,
  from?: Partial<T>
): T {
  const object = factory(constructor);
  if (from) {
    populate(object, from);
  }

  return object;
}

/**
 * Populates `object1` with the values of `object2`
 * @param object1
 * @param object2
 */
function populate(object1: ModelObject, object2: ModelObject): void {
  for (const key of Object.keys(object1)) {
    object1[key] = object2[key];
  }
}

export function factory<T>(Ctor: EmptyConstructor<T>) {
  return new Ctor();
}
