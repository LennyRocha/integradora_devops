import { ArgonPasswordHasher } from 'src/auth/infra/crypto/argon-password.hasher';

async function main() {
  const hasher = new ArgonPasswordHasher();

  const hashedPasswordAdmin = await hasher.hash('admin123');
  const hashedPasswordRecepcion = await hasher.hash('recepcion123');
  const hashedPasswordMecanico = await hasher.hash('mecanico123');

  console.log({
    hashedPasswordAdmin,
    hashedPasswordRecepcion,
    hashedPasswordMecanico,
  });
}

main().catch((error) => {
  console.error('Error generating hashed passwords:', error);
});
