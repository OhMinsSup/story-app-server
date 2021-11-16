import { Module } from '@nestjs/common';

// controllers
import { UsersController } from './users.controller';

// service
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
