import { MapModelDescriptorType } from "../types";
import { INSTANTIATE_REFLECT_PROPERTY_KEY } from "./model.decorator";

/**
 * Decorates a property to provide type-meta-data
 * @param constructor
 * @returns
 */
export function MapDate(): any {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const descriptorValue: MapModelDescriptorType<Date> = {
            constructor: Date,
            mapperConstructor: null,
            isDate: true
        };

        Reflect.defineMetadata(
            INSTANTIATE_REFLECT_PROPERTY_KEY,
            descriptorValue,
            target,
            propertyKey
        );
    };
}