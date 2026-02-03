import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CuentasModule } from './cuentas/cuentas.module';
import { Cuenta } from './cuentas/entities/cuenta.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_DATABASE || 'cooperativa_cuentas',
      entities: [Cuenta],
      synchronize: true, // Solo para desarrollo
      logging: true,
      autoLoadEntities: true,
    }),
    CuentasModule,
  ],
})
export class AppModule {}