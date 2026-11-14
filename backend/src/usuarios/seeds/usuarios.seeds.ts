import Rol from '../entity/rol';
import { Usuario } from '../entity/usuario.schema';

export const UsuarioSeeds: Usuario[] = [
  //admin123
  {
    nombre: 'Juan',
    apellidoP: 'Pérez',
    apellidoM: 'Jímenez',
    telefono: '5551234566',
    correo: 'admin@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$2ZbvtecqIuYd7NeRv853Eg$KVIn5c5q4EPz2pMjogNPhOS6ANZXdBFTLQ5qpCLqzoE',
    rol: Rol.ADMIN,
    status: true,
  },
  //recepcion123
  {
    nombre: 'José',
    apellidoP: 'Álvarez',
    apellidoM: 'Sanchez',
    telefono: '5551234567',
    correo: 'recepcion@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$IJ1uBqJuR2K47ObTwTQUyw$iDCYnxi9dCC+FeAkrYT9o7bsBtNEmJCJBRc+Uxzz6E4',
    rol: Rol.RECEPCIONISTA,
    status: true,
  },
  //mecanico123
  {
    nombre: 'María',
    apellidoP: 'Gómez',
    apellidoM: 'Barrera',
    telefono: '5551234568',
    correo: 'mecanico@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$XZbQdprohzp4M9B/skjotw$GHvSgKNiPJqscgG3lVVfSE6oKwbFhF7YVJt6G9V6pJ8',
    rol: Rol.MECANICO,
    status: true,
  },
];
