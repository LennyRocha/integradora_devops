import Rol from '../entity/rol';
import { Usuario } from '../entity/usuario.schema';

export const UsuarioSeeds: Usuario[] = [
  //admin123
  {
    nombre: 'Juan',
    apellidoP: 'Pérez',
    apellidoM: 'Jímenez',
    correo: 'admin@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$ydjs1OUupZkGvMYTzbYRzw$7XuOQlf0I+4Rdj5GJ6gyZgEe9zN/D+ymC/Dmaq6nxn4',
    rol: Rol.ADMIN,
    status: true,
  },
  //recepcion123
  {
    nombre: 'José',
    apellidoP: 'Álvarez',
    apellidoM: 'Sanchez',
    correo: 'recepcion@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$2WG19mrPpsSCXfXiO75elQ$IIZ/+HbsBG/+dmy00z8HeZdBaaVs/Jkj7VYnEN3ZK34',
    rol: Rol.RECEPCIONISTA,
    status: true,
  },
  //mecanico123
  {
    nombre: 'María',
    apellidoP: 'Gómez',
    apellidoM: 'Barrera',
    correo: 'mecanico@example.com',
    contra:
      '$argon2id$v=19$m=65536,t=3,p=4$fCiN9eR1YX2QNGis82p9XA$qQOtP6utS/Ttki0V9b18omZgXI/8Puunjid8R3LL690',
    rol: Rol.MECANICO,
    status: true,
  },
];
