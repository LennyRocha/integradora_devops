import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppModule } from 'src/app.module';
import { Usuario } from 'src/usuarios/entity/usuario.schema';
import { UsuarioSeeds } from '../src/usuarios/seeds/usuarios.seeds';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usuarioModel = app.get<Model<Usuario>>(getModelToken(Usuario.name));

    const operaciones = UsuarioSeeds.map((usuario) => ({
      updateOne: {
        filter: { correo: usuario.correo },
        update: { $setOnInsert: usuario },
        upsert: true,
      },
    }));

    const resultado = await usuarioModel.bulkWrite(operaciones);

    console.log('Seeding de usuarios completado');
    console.log(`Usuarios insertados: ${resultado.upsertedCount}`);
    console.log(`Usuarios existentes: ${resultado.matchedCount}`);
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
