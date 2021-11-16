import { Test, TestingModule } from '@nestjs/testing';
import { KlaytnService } from './klaytn.service';

describe('KlaytnService', () => {
  let service: KlaytnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KlaytnService],
    }).compile();

    service = module.get<KlaytnService>(KlaytnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
