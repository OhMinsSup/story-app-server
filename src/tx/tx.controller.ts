import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TxService } from './tx.service';

@ApiTags('거래')
@Controller('/api/tx')
export class TxController {
  constructor(private readonly service: TxService) {}

  @Get(':txHash')
  @ApiOperation({ summary: '영수증 조회' })
  getTransactionReceipt(@Param('txHash') txHash: string) {
    return this.service.getTransactionReceipt(txHash);
  }
}
