import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

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

  async updateGithubInfos(
    id: string,
    githubId: string,
    githubToken: string,
  ): Promise<void> {
    await this.usersRepository.upsert(
      {
        id,
        githubId,
        githubToken,
      },
      ['id'],
    );
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
