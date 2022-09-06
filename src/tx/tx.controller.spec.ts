import { Test, TestingModule } from '@nestjs/testing';
import { TxController } from './tx.controller';

describe('TxController', () => {
  let controller: TxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TxController],
    }).compile();

    controller = module.get<TxController>(TxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
