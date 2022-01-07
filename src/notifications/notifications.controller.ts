import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PushRequestDto } from './dto/push.request.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notification')
@Controller('/api/notifications')
export class MessageController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('token')
  @ApiOperation({
    summary: '푸시 public key를 가져온다.',
    description: '푸시 public key를 가져온다.',
  })
  getPushToken() {
    return this.notificationsService.getPushToken();
  }

  @Post('push')
  @ApiOperation({
    summary: '푸시 메시지 발송',
    description: '푸시 메시지를 발송합니다.',
  })
  @ApiBody({
    required: true,
    description: '푸시 메시지 발송',
    type: PushRequestDto,
  })
  push(@Body() input: PushRequestDto) {
    return this.notificationsService.push(input);
  }
}
