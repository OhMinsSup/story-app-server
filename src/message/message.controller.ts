import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PushRequestDto } from './dto/push.request.dto';
import { MessageService } from './message.service';

@ApiTags('Message')
@Controller('/api/messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('token')
  @ApiOperation({
    summary: '푸시 public key를 가져온다.',
    description: '푸시 public key를 가져온다.',
  })
  getPushToken() {
    return this.messageService.getPushToken();
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
    return this.messageService.push(input);
  }
}
