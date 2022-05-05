import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  imports: [],
  providers: [DeviceService, PrismaService],
  exports: [DeviceService],
  controllers: [DeviceController],
})
export class DeviceModule {}
