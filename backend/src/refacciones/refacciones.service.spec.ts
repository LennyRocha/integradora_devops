import { Test, TestingModule } from '@nestjs/testing';
import { RefaccionesService } from './refacciones.service';

describe('RefaccionesService', () => {
  let service: RefaccionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefaccionesService],
    }).compile();

    service = module.get<RefaccionesService>(RefaccionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
