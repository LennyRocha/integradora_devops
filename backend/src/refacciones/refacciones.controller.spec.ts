import { Test, TestingModule } from '@nestjs/testing';
import { RefaccionesController } from './refacciones.controller';

describe('RefaccionesController', () => {
  let controller: RefaccionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefaccionesController],
    }).compile();

    controller = module.get<RefaccionesController>(RefaccionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
