import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [FileService, PrismaService],
})
export class FileModule {}
