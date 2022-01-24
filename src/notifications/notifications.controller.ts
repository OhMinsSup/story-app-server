import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { NotificationsService } from './notifications.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { TokenPushRequestDto } from './dto/tokenPush.request.dto';
import type { Request } from 'express';

// https://github.com/bluekim98/notification-server/blob/main/src/notification/service/notification.service.ts
@ApiTags('Notification')
@Controller('/api/notifications')
export class NotificationController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('token')
  @ApiOperation({
    summary: '푸시 토큰을 저장한다.',
    description: '푸시 토큰을 저장한다.',
  })
  @ApiBody({
    required: true,
    description: '푸시 토큰 저장',
    type: TokenPushRequestDto,
  })
  token(@Req() req: Request, @Body() input: TokenPushRequestDto) {
    return this.notificationsService.token(input, req.headers['user-agent']);
  }

  test_send_v1(input: PushRequestDto) {
    return this.notificationsService.send(input);
  }

  test_send_v2(input: PushRequestDto) {
    return this.notificationsService.pushMessage(input);
  }
}
