import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  providers: [SearchService, PrismaService],
  controllers: [SearchController],
})
export class SearchModule {}
