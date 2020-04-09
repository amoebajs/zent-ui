# basic-modules
@amoebajs/basic-modules

## Install

```zsh
yarn add @amoebajs/basic-modules
```

## How to use

```typescript
import { Factory } from "@amoebajs/builder";
import { CommonModule, LayoutModule, ZentModule } from "@amoebajs/basic-modules";

export class BuilderFactory extends Factory {
  protected initModules() {
    super.initModules();
    this.useModule(CommonModule);
    this.useModule(LayoutModule);
    this.useModule(ZentModule);
  }
}

```

then use this new factory to generate your code.

## How to develop

1. clone repo https://github.com/amoebajs/builder in same directory with this repo
2. run `cd builder && yarn watch` or `cd builder && yarn build`
3. run `cd ../basic-modules`
3. now you can use `yarn build:only` to generayor source code with basic modules
