import { Module } from '@nestjs/common';

// controller
import { FilesController } from './files.controller';

// service
import { FilesService } from './files.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [FilesService, PrismaService],
  controllers: [FilesController],
})
export class FilesModule {}
