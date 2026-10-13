import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline';
if (!process.stdin.isTTY) { console.error('Ejecuta este generador en una terminal interactiva. No pases contraseñas por argumentos.'); process.exit(1); }
console.log('Contraseña del panel (mínimo 12 caracteres; la entrada se oculta):');
const input = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
input._writeToOutput = () => {};
input.question('', password => {
  input.close();
  if (password.length < 12 || password.length > 256) { console.error('\nLongitud inválida.'); process.exitCode = 1; return; }
  const salt = randomBytes(16).toString('hex');
  console.log(`\nPANEL_PASSWORD_HASH=scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`);
  console.log(`APP_SECRET=${randomBytes(32).toString('hex')}`);
  console.log(`CONEXIGO_WEBHOOK_SECRET=${randomBytes(32).toString('hex')}`);
  console.log(`CRON_SECRET=${randomBytes(32).toString('hex')}`);
  console.log('Guarda estas variables SOLO en .env.local o en el servidor. No cambies APP_SECRET después de activar rastros sin planificar la rotación.');
});
