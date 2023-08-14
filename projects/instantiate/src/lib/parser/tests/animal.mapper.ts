import { AbstractionMapper } from '../../mapper/abstraction-mapper';
import { EmptyConstructor } from '../../types';
import { Animal, AnimalType, Dog, Lion, Mammal, MammalType } from './animal';

export class AnimalMapper extends AbstractionMapper<Animal> {
  override getConstructor(from: Partial<Animal>): EmptyConstructor<Animal> {
    switch (from.animalType) {
      case AnimalType.Mammal:
        return this.getMammal(from as Partial<Mammal>);
      default:
        throw Error('Not yet implemented');
    }
  }

  getMammal(from: Partial<Mammal>): EmptyConstructor<Mammal> {
    switch (from.mammalType) {
      case MammalType.Dog:
        return Dog;
      case MammalType.Lion:
        return Lion;
      default:
        throw Error(`Not yet mapped ${from.mammalType}`);
    }
  }
}
