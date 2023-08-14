import { MapAbstractModel } from '../../decorators/model.decorator';
import { AnimalMapper } from './animal.mapper';

export enum AnimalType {
  Mammal = 'Mammal',
  Other = 'Other',
}

export enum MammalType {
  Dog = 'Dog',
  Lion = 'Lion',
}

export abstract class Animal {
  abstract animalType: AnimalType;

  @MapAbstractModel(AnimalMapper)
  children: Animal[] = [];
}

export abstract class Mammal extends Animal {
  override animalType: AnimalType = AnimalType.Mammal;
  abstract mammalType: MammalType;
  abstract get sound(): string;
}

export class Dog extends Mammal {
  override mammalType = MammalType.Dog;

  override get sound(): string {
    return 'Woef';
  }
}

export class Lion extends Mammal {
  override mammalType = MammalType.Lion;
  override get sound(): string {
    return 'Rawr';
  }
}
