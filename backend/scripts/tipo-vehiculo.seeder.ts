import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from 'src/app.module';
import { TipoVehiculoSeeds } from 'src/vehiculos/seeds/tipos.seeds';
import { TipoVehiculo } from 'src/vehiculos/entity/tipo-vehiculo.schema';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const tipoVehiculoModel = app.get<Model<TipoVehiculo>>(
      getModelToken(TipoVehiculo.name),
    );

    const operaciones = TipoVehiculoSeeds.map((tipo) => ({
      updateOne: {
        filter: { tipo: tipo.tipo },
        update: { $setOnInsert: tipo },
        upsert: true,
      },
    }));

    const resultado = await tipoVehiculoModel.bulkWrite(operaciones);

    console.log('Seeding de tipos de vehículo completado');
    console.log(`Tipos de vehículo insertados: ${resultado.upsertedCount}`);
    console.log(`Tipos de vehículo existentes: ${resultado.matchedCount}`);
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Error al ejecutar el seeder:', error);
  process.exitCode = 1;
});
