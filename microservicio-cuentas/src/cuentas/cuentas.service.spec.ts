import { Test, TestingModule } from '@nestjs/testing';
import { CuentasService } from './cuentas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CuentaRequestDto } from './dto/cuenta-request.dto';

describe('CuentasService', () => {
  let service: CuentasService;
  let repository: Repository<Cuenta>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentasService,
        {
          provide: getRepositoryToken(Cuenta),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CuentasService>(CuentasService);
    repository = module.get<Repository<Cuenta>>(getRepositoryToken(Cuenta));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearCuenta', () => {
    const requestDto: CuentaRequestDto = {
      socioId: '123e4567-e89b-12d3-a456-426614174000',
      numeroCuenta: '001-100000005',
      saldo: 1000,
      tipoCuenta: 'AHORRO',
    };

    it('debe crear una cuenta exitosamente cuando el número de cuenta es único', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      const cuentaCreada = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        ...requestDto,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockRepository.create.mockReturnValue(cuentaCreada);
      mockRepository.save.mockResolvedValue(cuentaCreada);

      // Act
      const result = await service.crearCuenta(requestDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.numeroCuenta).toBe(requestDto.numeroCuenta);
      expect(result.saldo).toBe(requestDto.saldo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { numeroCuenta: requestDto.numeroCuenta, activo: true },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando el número de cuenta ya existe', async () => {
      // Arrange
      const cuentaExistente = { id: '123', numeroCuenta: requestDto.numeroCuenta };
      mockRepository.findOne.mockResolvedValue(cuentaExistente);

      // Act & Assert
      await expect(service.crearCuenta(requestDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debe asignar estado ACTIVA y activo true por defecto', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      const cuentaCreada = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        ...requestDto,
        estado: 'ACTIVA',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockRepository.create.mockReturnValue(cuentaCreada);
      mockRepository.save.mockResolvedValue(cuentaCreada);

      // Act
      await service.crearCuenta(requestDto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'ACTIVA',
          activo: true,
        }),
      );
    });
  });

  describe('obtenerCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe retornar una cuenta cuando existe y está activa', async () => {
      // Arrange
      const cuenta = {
        id: cuentaId,
        socioId: '123e4567-e89b-12d3-a456-426614174000',
        numeroCuenta: '001-100000001',
        saldo: 5000,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockRepository.findOne.mockResolvedValue(cuenta);

      // Act
      const result = await service.obtenerCuenta(cuentaId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(cuentaId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: cuentaId, activo: true },
      });
    });

    it('debe lanzar NotFoundException cuando la cuenta no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerCuenta(cuentaId)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException cuando la cuenta no está activa', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.obtenerCuenta(cuentaId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: cuentaId, activo: true },
      });
    });
  });

  describe('obtenerCuentasPorSocio', () => {
    const socioId = '123e4567-e89b-12d3-a456-426614174000';

    it('debe retornar todas las cuentas activas de un socio', async () => {
      // Arrange
      const cuentas = [
        {
          id: '1',
          socioId,
          numeroCuenta: '001-100000001',
          saldo: 5000,
          estado: 'ACTIVA',
          tipoCuenta: 'AHORRO',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
        {
          id: '2',
          socioId,
          numeroCuenta: '001-100000002',
          saldo: 10000,
          estado: 'ACTIVA',
          tipoCuenta: 'CORRIENTE',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];
      mockRepository.find.mockResolvedValue(cuentas);

      // Act
      const result = await service.obtenerCuentasPorSocio(socioId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].socioId).toBe(socioId);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { socioId, activo: true },
        order: { fechaCreacion: 'DESC' },
      });
    });

    it('debe retornar un array vacío cuando el socio no tiene cuentas', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.obtenerCuentasPorSocio(socioId);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debe ordenar las cuentas por fecha de creación descendente', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      await service.obtenerCuentasPorSocio(socioId);

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { fechaCreacion: 'DESC' },
        }),
      );
    });
  });

  describe('actualizarCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';
    const updateDto: CuentaRequestDto = {
      socioId: '123e4567-e89b-12d3-a456-426614174000',
      numeroCuenta: '001-100000001',
      saldo: 6000,
      tipoCuenta: 'AHORRO',
    };

    it('debe actualizar una cuenta exitosamente', async () => {
      // Arrange
      const cuentaExistente = {
        id: cuentaId,
        socioId: '123e4567-e89b-12d3-a456-426614174000',
        numeroCuenta: '001-100000001',
        saldo: 5000,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockRepository.findOne.mockResolvedValue(cuentaExistente);
      mockRepository.save.mockResolvedValue({ ...cuentaExistente, ...updateDto });

      // Act
      const result = await service.actualizarCuenta(cuentaId, updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException cuando la cuenta no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.actualizarCuenta(cuentaId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException cuando el nuevo número de cuenta ya existe', async () => {
      // Arrange
      const cuentaExistente = {
        id: cuentaId,
        numeroCuenta: '001-100000001',
        activo: true,
      };
      const otraCuenta = {
        id: 'otro-id',
        numeroCuenta: '001-100000999',
        activo: true,
      };
      
      mockRepository.findOne
        .mockResolvedValueOnce(cuentaExistente)
        .mockResolvedValueOnce(otraCuenta);

      const dtoConNumeroExistente = { ...updateDto, numeroCuenta: '001-100000999' };

      // Act & Assert
      await expect(
        service.actualizarCuenta(cuentaId, dtoConNumeroExistente),
      ).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('obtenerTodasCuentas', () => {
    it('debe retornar solo cuentas activas y con estado ACTIVA', async () => {
      // Arrange
      const cuentas = [
        {
          id: '1',
          socioId: '123',
          numeroCuenta: '001-100000001',
          saldo: 5000,
          estado: 'ACTIVA',
          tipoCuenta: 'AHORRO',
          activo: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];
      mockRepository.find.mockResolvedValue(cuentas);

      // Act
      const result = await service.obtenerTodasCuentas();

      // Assert
      expect(result).toHaveLength(1);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { activo: true, estado: 'ACTIVA' },
      });
    });

    it('debe retornar array vacío cuando no hay cuentas activas', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.obtenerTodasCuentas();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('eliminarCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe realizar eliminación lógica de una cuenta', async () => {
      // Arrange
      const cuenta = {
        id: cuentaId,
        socioId: '123',
        numeroCuenta: '001-100000001',
        saldo: 5000,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockRepository.findOne.mockResolvedValue(cuenta);
      mockRepository.save.mockResolvedValue({ ...cuenta, activo: false });

      // Act
      await service.eliminarCuenta(cuentaId);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          activo: false,
        }),
      );
    });

    it('debe lanzar NotFoundException cuando la cuenta no existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.eliminarCuenta(cuentaId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
