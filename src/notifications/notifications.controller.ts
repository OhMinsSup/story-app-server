import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// service
import { NotificationsService } from './notifications.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { SavePushRequestDto } from './dto/savePush.request.dto';
import type { Request } from 'express';

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
    type: SavePushRequestDto,
  })
  async save(@Req() req: Request, @Body() input: SavePushRequestDto) {
    return this.notificationsService.save(input, req.headers['user-agent']);
  }

  @Post('send')
  @ApiOperation({
    summary: '푸시 메시지 발송',
    description: '푸시 메시지를 발송합니다.',
  })
  @ApiBody({
    required: true,
    description: '푸시 메시지 발송',
    type: PushRequestDto,
  })
  sendPush(@Body() input: PushRequestDto) {
    return this.notificationsService.sendPush(input);
  }
}
