import { Observable, of, firstValueFrom } from 'rxjs';
import { MapAbstractObservable } from '../decorators/observable.decorator';
import { parseAbstraction } from './parser';
import { Dog, AnimalType, MammalType, Animal } from './tests/animal';
import { AnimalMapper } from './tests/animal.mapper';

const BlackyJuniorJS: Partial<Dog> = {
  animalType: AnimalType.Mammal,
  mammalType: MammalType.Dog,
};

const BlackyJS: Partial<Dog> = {
  animalType: AnimalType.Mammal,
  mammalType: MammalType.Dog,
  children: [BlackyJuniorJS as Animal],
};

class AnimalService {
  @MapAbstractObservable(AnimalMapper)
  getBlacky(): Observable<Animal> {
    return of(BlackyJS as Dog);
  }
}

describe('Abstract Parser tests', () => {
  it('Should use the mapper type to map and return the most concrete instance', () => {
    const blackyTS = parseAbstraction(AnimalMapper, BlackyJS);
    const dogResult = blackyTS instanceof Dog;
    expect(dogResult).toBeTrue();
  });

  it('Should use a mapper to parse abstracted classes in observables', async () => {
    const result = await firstValueFrom(new AnimalService().getBlacky());
    const dogResult = result instanceof Dog;
    expect(dogResult).toBeTrue();
  });

  it('Should map nested abstractions when decorated', async () => {
    const parsed = await firstValueFrom(new AnimalService().getBlacky());
    const testResult = parsed.children.every((c) => c instanceof Animal);

    expect(testResult).toBeTrue();
  });
});
