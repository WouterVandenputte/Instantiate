# Instantiate

The Instantiate package was designed in the first place to combat the false HTTP client return type, but can be used in various other scenario's as well. This leightweight package has been created for fellow developpers to map raw JavaScript objects to actual Typescript class instances with actual methods and accessors. It is a leightweigt package which is very easy to install and to use.

## Installation

Simply add this dependency to your `package.json` file

    npm i --save instantiate-typescript

**NOTE**: make sure your project is configured to target at least ES2022 in you `tsconfig.json` file. If this is not feasable for your project, it might also help to set `useDefineForClassFields` to `true`.

## Usage

This package was designed to easily integrate the functionality using decorators.

### Decorate methods

When an HTTP call returns an observable of a certain class, all that is required is to decorate the method itself using `@MapObservable(ClassName)`. The following example demonstrates a service that retrieves a simple set of users out of which the response will be a list of JS objects with only a `firstName` and `lastName` property. The argument given to the decorator is the constructor type of the TS class to instantiate. Note that the library automatically detects array types from the response.

    export class User {
      firstName!: string;
      lastName!: string;

      get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
      }
    }


    @Injectable({
      providedIn: 'root',
    })
    export class AppService {

      constructor(private readonly httpClient: HttpClient) { }

      @MapObservable(User)
      public getUsers(): Observable<User[]> {
        return this.httpClient.get<User[]>('...[yourUrl]...')
      }
    }

### Nesting

Suppose our `User` class has a nested class properties. It suffices to simply decorate those properties using the `MapModel` decorator and the library will automatically create TS class instances of those sub-properties as well.

    class Address {
      zipcode!: string;
    }

    class User {
      firstName!: string;
      lastName!: string;

      @MapModel(Address)
      address?: Address;
      ...
    }

In the example above we also illustrate that properties can be optional, this does not affect the package behaviour. When no `address` has been defined in the JS object, no `address` value will be present in the `User` instance as well.

### Abstractions

Abstract classes cannot be instantiated as per definition. But this should not pose a limitation on instantiating concrete classes. Contrary to similar packages, this package has explicitly opted for an approach that gives the package user full control over the mapping of a raw JS object to a concrete TS instance that inherits from a specified abstract class. This is done using the `MapAbstractObservable` decorator for methods and the `MapAbstractModel` decorator for properties. Consider the abstract classes below for our next example

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

`Animal` and `Mammal` are abstract classes. A property that defines if an object is either a `Lion` or a `Dog` should be present in the given JS object.

In order to map this, the implementor is required to provide a constructor of a class that can handle mapping. I.e., the given argument of the decorator must be the name of a class that inherits from our `AbstractionMapper<T>` and implements the `getConstructor(from: Partial<T> | Nothing): EmptyConstructor<T>` method. For our exmample we could write this mapper

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

**Note that this should not be a discrete property**. One could for example also have a property within a continious range.

    abstract class Human {
        length: number;
    }

    class TallHuman extends Human {}
    class SmallHuman extends Human {}

    export class HumanMapper extends AbstractionMapper<Human> {
      override getConstructor(from: Partial<Human>): EmptyConstructor<Human> {
        return from.length > [threshold] ? TallHuman : SmallHuman;
      }
    }

### A note on JavaScript dates

This package now also supports the mapping to a JS Date object, which is the same as a Typescript date object. Serializing dates to be sent over the network in essence always comes down to stringifying it to a universial notation (UTC) although a few other options also exist. Whatever the server chooses to serialize dates, as long as the JS date object can work with it, so can this packge. In order to map incoming seralized dates to class instances, a separate argumentless `MapDate` decorator can be used. If we revisit our earlier example, we can extend our model like this:

    class User {
      ...
      @MapDate()
      registrationDate!: Date;
      ...
    }

## Implications

There are two dominant reasons why one would choose to have actual TS instances. After all, we could simply provide the data from our server to our webapp and provide all data in there instead of having methods or accessors in classes.

1. Lower network latency and server load
2. Default values and overwrites
3. Best practices

### Latency and server load

Using the approach as seen in the `User` example, we elliminate a text property for every single user, resulting in a response that is 1/3 smaller as it otherwise would be. Extrapolating this to a datagrid with hundreds of users it can quickly become more desirable to migrate this accessor to the client.

### Default values and overwrites

When we take for example a .NET webapp, we could define a class as following

    class MyClass {
        public int MyProp1 { get; set; }

        [DefaultValue(true)]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool IsActive { get; set; } = true;
    }

I.e., we assume that the vast majority of instances have this `IsActive`-flag set to `true`. It thus makes no sense to always serialize (which always comes with a cost) this except for the rare cases in which the flag is false. This package allows us to write our TS class as following

    export class MyClass {
        myProp1!: number;
        isActive = true;
    }

Using this default value, every class is immeditaly created with the flag set to true. But whenever the JS objects says something different, it simply gets overwritten.

### Best practices

Telling your compiler that the angular `HttpClient.get<T>` method will return a `T` is actually you lying to it. A simple check can confirm this

    this.httpClient.get<User>(...).subscribe(response => {
        console.log('Return type is user:', response instanceof User);
    });

> Return type is user: false

By following this original methodology, your application will be inconsistenly using both JS and TS objects without notice untill runtime errors arise.

## Further help

This package has been created using Jasmine tests that all pass before deployment, however it may very well be possible that some specific edge scenarios are not yet covered. Do reach out on our [GitHub page](https://github.com/WouterVandenputte/Instantiate) issues'-tab to notify any bugs and/or suggest improvements.
