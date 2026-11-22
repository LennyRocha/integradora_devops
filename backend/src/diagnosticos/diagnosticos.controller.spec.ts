import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticosController } from './diagnosticos.controller';

describe('DiagnosticosController', () => {
  let controller: DiagnosticosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosticosController],
    }).compile();

    controller = module.get<DiagnosticosController>(DiagnosticosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
