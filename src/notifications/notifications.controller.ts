import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { NotificationsService } from './notifications.service';

// dto
import { TokenPushRequestDto } from './dto/tokenPush.request.dto';
import type { Request } from 'express';

@ApiTags('Notification')
@Controller('/api/notifications')
export class NotificationController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('device')
  @ApiOperation({
    summary: '푸시 토큰을 저장한다.',
    description: '푸시 토큰을 저장한다.',
  })
  @ApiBody({
    required: true,
    description: '푸시 토큰 저장',
    type: TokenPushRequestDto,
  })
  device(@Req() req: Request, @Body() input: TokenPushRequestDto) {
    return this.notificationsService.device(input, req.headers['user-agent']);
  }
}
