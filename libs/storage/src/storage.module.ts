import { Global, Module } from '@nestjs/common';

import { services } from './application';
import { controllers } from './infra';

@Global()
@Module({
  controllers: controllers,
  providers: services,
})
export class StorageModule {}

// =================================
// TODO: move to a separate file
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================
