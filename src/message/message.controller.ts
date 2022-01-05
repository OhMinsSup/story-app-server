import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PushRequestDto } from './dto/push.request.dto';
import { MessageService } from './message.service';

@ApiTags('Message')
@Controller('/api/message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('/push')
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
    console.log(input);
    return this.messageService.push();
  }
}

// const subscription = JSON.parse(request.payload.subscription);
//     const data = request.payload.data;
//     const options = {
//       TTL: 24 * 60 * 60,
//       vapidDetails: {
//         subject: 'mailto: UR E-mail',
//         publicKey: vapidKeys.publicKey,
//         privateKey: vapidKeys.privateKey
//       }
//     };
//     webpush.sendNotification( subscription, data, options );
