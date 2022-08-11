import { Inject, Injectable } from '@nestjs/common';
import type Caver from 'caver-js';
import { KLAYTN } from 'src/constants/config';

@Injectable()
export class KlaytnService {
  constructor(@Inject(KLAYTN) private readonly caver: Caver) {}
}
