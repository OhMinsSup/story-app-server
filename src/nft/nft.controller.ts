import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

// services
import { NftService } from './nft.service';

// guard
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { AuthUser } from 'src/auth/get-user.decorator';

// types
import type { User } from '.prisma/client';
import { SellerRequestDto } from './dto/seller.request.dto';

@ApiTags('Nfts')
@Controller('/api/stories')
export class NftController {
  constructor(private nftService: NftService) {}

  @Put(':id/nfts/transferOwnership')
  @UseGuards(LoggedInGuard)
  @ApiOperation({ summary: '토큰 소유권 이전 API' })
  transferOwnership(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.nftService.transferOwnership(user, id);
  }

  @Post(':id/nfts/buyer')
  @UseGuards(LoggedInGuard)
  @ApiOperation({ summary: '토큰 구매자 설정 API' })
  buyer(@AuthUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.nftService.buyer(user, id);
  }

  @Post(':id/nfts/seller')
  @UseGuards(LoggedInGuard)
  @ApiOperation({ summary: '토큰 판매자 설정 API' })
  @ApiBody({
    required: true,
    description: '가격 제시 데이터',
    type: SellerRequestDto,
  })
  seller(
    @AuthUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: SellerRequestDto,
  ) {
    return this.nftService.seller(user, id, input);
  }

  @Get(':id/nfts/histories')
  @ApiOperation({
    summary: '거래내역 조회 API',
  })
  histories(@Param('id', ParseIntPipe) id: number) {
    return this.nftService.histories(id);
  }
}
