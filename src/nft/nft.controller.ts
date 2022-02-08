import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// services
import { NftService } from './nft.service';

// guard
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/auth/get-user.decorator';

// types
import type { User } from '.prisma/client';

@ApiTags('Nfts')
@Controller('/api/nfts')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post(':id/transferOwnership')
  @UseGuards(LoggedInGuard)
  @ApiOperation({ summary: '토큰 소유권 이전 API' })
  transferOwnership(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.nftService.transferOwnership(user, id);
  }
}
