import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

// guard
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/decorators/get-user.decorator';

// service
import { NotificationsService } from './notifications.service';

// dto
import { PushRequestDto } from './dto/push.request.dto';
import { SavePushRequestDto } from './dto/savePush.request.dto';

@ApiTags('Notification')
@Controller('/api/notifications')
export class NotificationController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  get(@Req() req) {
    // generate browser unique id
    console.log(req);
    return null;
  }

  @Post('token')
  @UseGuards(LoggedInGuard)
  @ApiOperation({
    summary: '푸시 토큰을 저장한다.',
    description: '푸시 토큰을 저장한다.',
  })
  @ApiBody({
    required: true,
    description: '푸시 토큰 저장',
    type: SavePushRequestDto,
  })
  save(@AuthUser() user: User, @Body() input: SavePushRequestDto) {
    return this.notificationsService.save(user, input);
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
