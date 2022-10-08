import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserProfileDTO } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async upsert(id: string, userDto: UserDTO): Promise<void> {
    await this.usersRepository.upsert(
      {
        id,
        ...userDto,
      },
      ['id'],
    );
  }

  async update(id: string, userDto: UserDTO): Promise<void> {
    await this.usersRepository.update(id, userDto);
  }

  async updateProfile(
    id: string,
    userProfileDto: UserProfileDTO,
  ): Promise<void> {
    await this.usersRepository.update(id, userProfileDto);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
