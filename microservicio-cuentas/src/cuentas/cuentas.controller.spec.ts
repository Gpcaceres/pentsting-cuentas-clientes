import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';
import { CuentaRequestDto } from './dto/cuenta-request.dto';
import { NotFoundException } from '@nestjs/common';

describe('CuentasController', () => {
  let controller: CuentasController;
  let service: CuentasService;

  const mockService = {
    crearCuenta: jest.fn(),
    obtenerCuenta: jest.fn(),
    obtenerTodasCuentas: jest.fn(),
    obtenerCuentasPorSocio: jest.fn(),
    actualizarCuenta: jest.fn(),
    eliminarCuenta: jest.fn(),
    realizarRetiro: jest.fn(),
    realizarDeposito: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [
        {
          provide: CuentasService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CuentasController>(CuentasController);
    service = module.get<CuentasService>(CuentasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearCuenta', () => {
    it('debe crear una cuenta y retornar 201', async () => {
      // Arrange
      const requestDto: CuentaRequestDto = {
        socioId: '123e4567-e89b-12d3-a456-426614174000',
        numeroCuenta: '001-100000005',
        saldo: 1000,
        tipoCuenta: 'AHORRO',
      };
      const expectedResponse = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        ...requestDto,
        estado: 'ACTIVA',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockService.crearCuenta.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.crearCuenta(requestDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.crearCuenta).toHaveBeenCalledWith(requestDto);
    });
  });

  describe('obtenerTodas', () => {
    it('debe retornar todas las cuentas activas', async () => {
      // Arrange
      const expectedCuentas = [
        {
          id: '1',
          socioId: '123',
          numeroCuenta: '001-100000001',
          saldo: 5000,
          estado: 'ACTIVA',
          tipoCuenta: 'AHORRO',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];
      mockService.obtenerTodasCuentas.mockResolvedValue(expectedCuentas);

      // Act
      const result = await controller.obtenerTodas();

      // Assert
      expect(result).toEqual(expectedCuentas);
      expect(service.obtenerTodasCuentas).toHaveBeenCalled();
    });

    it('debe retornar array vacío cuando no hay cuentas', async () => {
      // Arrange
      mockService.obtenerTodasCuentas.mockResolvedValue([]);

      // Act
      const result = await controller.obtenerTodas();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('obtenerCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe retornar una cuenta específica', async () => {
      // Arrange
      const expectedCuenta = {
        id: cuentaId,
        socioId: '123',
        numeroCuenta: '001-100000001',
        saldo: 5000,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockService.obtenerCuenta.mockResolvedValue(expectedCuenta);

      // Act
      const result = await controller.obtenerCuenta(cuentaId);

      // Assert
      expect(result).toEqual(expectedCuenta);
      expect(service.obtenerCuenta).toHaveBeenCalledWith(cuentaId);
    });

    it('debe propagar NotFoundException del servicio', async () => {
      // Arrange
      mockService.obtenerCuenta.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.obtenerCuenta(cuentaId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerPorSocio', () => {
    const socioId = '123e4567-e89b-12d3-a456-426614174000';

    it('debe retornar todas las cuentas de un socio', async () => {
      // Arrange
      const expectedCuentas = [
        {
          id: '1',
          socioId,
          numeroCuenta: '001-100000001',
          saldo: 5000,
          estado: 'ACTIVA',
          tipoCuenta: 'AHORRO',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        },
      ];
      mockService.obtenerCuentasPorSocio.mockResolvedValue(expectedCuentas);

      // Act
      const result = await controller.obtenerPorSocio(socioId);

      // Assert
      expect(result).toEqual(expectedCuentas);
      expect(service.obtenerCuentasPorSocio).toHaveBeenCalledWith(socioId);
    });
  });

  describe('actualizarCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe actualizar una cuenta exitosamente', async () => {
      // Arrange
      const updateDto: CuentaRequestDto = {
        socioId: '123',
        numeroCuenta: '001-100000001',
        saldo: 6000,
        tipoCuenta: 'AHORRO',
      };
      const expectedResponse = {
        id: cuentaId,
        ...updateDto,
        estado: 'ACTIVA',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockService.actualizarCuenta.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.actualizarCuenta(cuentaId, updateDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.actualizarCuenta).toHaveBeenCalledWith(cuentaId, updateDto);
    });
  });

  describe('eliminarCuenta', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe eliminar una cuenta exitosamente', async () => {
      // Arrange
      mockService.eliminarCuenta.mockResolvedValue(undefined);

      // Act
      await controller.eliminarCuenta(cuentaId);

      // Assert
      expect(service.eliminarCuenta).toHaveBeenCalledWith(cuentaId);
    });

    it('debe propagar NotFoundException del servicio', async () => {
      // Arrange
      mockService.eliminarCuenta.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.eliminarCuenta(cuentaId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('realizarRetiro', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe realizar un retiro exitosamente', async () => {
      // Arrange
      const monto = 500;
      const expectedResponse = {
        id: cuentaId,
        socioId: '123',
        numeroCuenta: '001-100000001',
        saldo: 4500,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockService.realizarRetiro.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.realizarRetiro(cuentaId, monto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.realizarRetiro).toHaveBeenCalledWith(cuentaId, monto);
    });
  });

  describe('realizarDeposito', () => {
    const cuentaId = '550e8400-e29b-41d4-a716-446655440000';

    it('debe realizar un depósito exitosamente', async () => {
      // Arrange
      const monto = 1000;
      const expectedResponse = {
        id: cuentaId,
        socioId: '123',
        numeroCuenta: '001-100000001',
        saldo: 6000,
        estado: 'ACTIVA',
        tipoCuenta: 'AHORRO',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };
      mockService.realizarDeposito.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.realizarDeposito(cuentaId, monto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.realizarDeposito).toHaveBeenCalledWith(cuentaId, monto);
    });
  });
});
