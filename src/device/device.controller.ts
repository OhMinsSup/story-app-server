import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// decorator
import { AuthUser } from 'src/auth/get-user.decorator';
import { LoggedInGuard } from 'src/auth/logged-in.guard';

// service
import { DeviceService } from './device.service';

// dto
import { DeviceRequestDto } from './dto/device.request.dto';

// types
import type { User } from '@prisma/client';

@ApiTags('Device')
@UseGuards(LoggedInGuard)
@Controller('/api/devices')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Post()
  @ApiOperation({
    summary: '디바이스 등록',
    description: '디바이스 정보를 저장한다.',
  })
  @ApiBody({
    required: true,
    description: '디바이스 등록 정보',
    type: DeviceRequestDto,
  })
  create(@AuthUser() user: User, @Body() input: DeviceRequestDto) {
    return this.deviceService.create(user, input);
  }
}
