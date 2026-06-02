import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [{ id: 1, name: 'Jorge', email: 'jorge@test.com', deleted_at: "null" }];
  private nextId = 2;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const newUser: User = { id: this.nextId++, name: createUserDto.name, email: createUserDto.email, deleted_at: "null" };
    this.users.push(newUser);
    return newUser;
  }

  update(id: number, createUserDto: CreateUserDto){
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if(!createUserDto.email || !createUserDto.name){
      throw new NotFoundException(`empty fields.`);
    }

    user.name = createUserDto.name;
    user.email = createUserDto.email;

    return user;
  }

  delete(id: number){
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.deleted_at = new Date().toString();
    return user;
  }
}
