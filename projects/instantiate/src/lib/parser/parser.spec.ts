import { TestBed } from '@angular/core/testing';
import { parsePartialToRealObject } from './parser';
import { MapModel } from '../decorators/model.decorator';
import { MapObservable } from '../decorators/observable.decorator';
import { Observable, firstValueFrom, of } from 'rxjs';

class Address {
  zipcode!: string;
}

class User {
  firstName!: string;
  lastName!: string;

  @MapModel(Address)
  address?: Address;

  rawJsAddress?: Address;

  @MapModel(User)
  linkedUsers?: User[];

  getGreeting(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

const MaryJS: Partial<User> = {
  firstName: 'Mary',
  lastName: 'Lucky',
  address: {
    zipcode: '5678',
  },
  rawJsAddress: {
    zipcode: 'ABCD',
  },
};

const JohnJS: Partial<User> = {
  firstName: 'John',
  lastName: 'Doe',
  address: {
    zipcode: '1234',
  },
  linkedUsers: [MaryJS as User],
};

const JohnTS = parsePartialToRealObject(User, JohnJS);
const MaryTS = parsePartialToRealObject(User, MaryJS);

class UserService {
  @MapObservable(User)
  public getJohn(): Observable<User> {
    return of(JohnJS as User);
  }

  @MapObservable(User)
  public getJohnWithNull(): Observable<User> {
    return of(null as unknown as User);
  }
}

describe('Parser', () => {
  it('Should be the real model', () => {
    const result = JohnTS instanceof User;

    expect(result).toBeTrue();
  });
  it('Should have direct sub properties filled in', () => {
    expect(JohnTS.firstName).toBe('John');
  });
  it('Should have an actual Address class instance', () => {
    const result = JohnTS.address instanceof Address;

    expect(result).toBeTrue();
  });
  it('Should have a list instantiation', () => {
    expect(Array.isArray(JohnTS.linkedUsers)).toBeTrue();

    const firstUser = JohnTS.linkedUsers?.[0];
    const result = firstUser instanceof User;
    expect(result).toBeTrue();
  });
  it('Class methods work', () => {
    const fnExec = JohnTS.getGreeting();
    expect(fnExec).toBeDefined();
  });
  it('Should map observables to class instances due to decorated methods', async () => {
    const johnResult = await firstValueFrom(new UserService().getJohn());
    const testResult = johnResult instanceof User;
    expect(testResult).toBeTrue();
  });
  it('Should return null without errors', async () => {
    const nullResult = await firstValueFrom(
      new UserService().getJohnWithNull()
    );
    expect(nullResult).toBeNull();
  });
  it('Should ignore non decorated fields', () => {
    const maryAddressJS = MaryTS.rawJsAddress;
    const testResult = maryAddressJS instanceof Address;

    expect(testResult).toBeFalse();
  });
});
