import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { User } from 'src/entities/user.entity';
import { FindOperator, LessThan, Repository } from 'typeorm';
import { UserDTO, UserProfileDTO } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(maxSynchronizedDate?: Date): Promise<User[]> {
    const where: { lastSynchronize?: Date | FindOperator<Date> } = {};
    if (maxSynchronizedDate) {
      where.lastSynchronize = LessThan(maxSynchronizedDate);
    }
    return this.usersRepository.find({
      where,
    });
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOne({
      relations: {
        repos: true,
      },
      where: {
        id,
      },
    });
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

  async addRepositories(user: User, repos: Repo[]): Promise<void> {
    user.repos.push(...repos);
    await this.usersRepository.save(user);
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
