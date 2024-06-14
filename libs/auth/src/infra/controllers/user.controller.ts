import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AllowRoles } from '../decorators';
import { AllowedRoles, Authenticated } from '../guards';

const fakeUsers = [
  { id: 1, name: 'John Doe', usename: 'johndoe' },
  { id: 2, name: 'Homer Simpson', usename: 'homersimpson' },
  { id: 3, name: 'Peter Griffin', usename: 'petergriffin' },
];

@Controller('users')
@UseGuards(Authenticated, AllowedRoles)
export class UserController {
  constructor() {}

  @Get()
  @AllowRoles()
  listUsers() {
    return fakeUsers;
  }

  @Get(':id')
  @AllowRoles(['admin'])
  getUser(@Param('id') id: string) {
    const user = fakeUsers.find((u) => u.id === +id);
    if (!user) new BadRequestException('User not found');
    return user;
  }

  @Delete(':id')
  @AllowRoles(['admin'])
  deleteUser(@Param('id') id: string) {
    const index = fakeUsers.findIndex((u) => u.id === +id);
    if (index === -1) new BadRequestException('User not found');
    fakeUsers.splice(index, 1);
    return { message: 'User deleted' };
  }

  @Patch(':id')
  @AllowRoles(['admin'])
  updateUserRole(@Param('id') id: string) {
    const user = fakeUsers.find((u) => u.id === +id);
    if (!user) new BadRequestException('User not found');
    return { message: 'User role updated' };
  }
}

export default UserController;
