import { Test, TestingModule } from '@nestjs/testing';
import { PaymongoController } from './paymongo.controller';
import { PaymongoService } from './paymongo.service';

describe('PaymongoController', () => {
  let controller: PaymongoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymongoController],
      providers: [PaymongoService],
    }).compile();

    controller = module.get<PaymongoController>(PaymongoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
