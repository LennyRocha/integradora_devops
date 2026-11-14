import { ArgonPasswordHasher } from 'src/auth/infra/crypto/argon-password.hasher';

async function main() {
  const hasher = new ArgonPasswordHasher();

  const hashedPasswordAdmin = await hasher.hash('#Admin123');
  const hashedPasswordRecepcion = await hasher.hash('#Recepcion123');
  const hashedPasswordMecanico = await hasher.hash('#Mecanico123');

  console.log({
    hashedPasswordAdmin,
    hashedPasswordRecepcion,
    hashedPasswordMecanico,
  });
}

main().catch((error) => {
  console.error('Error generating hashed passwords:', error);
});
