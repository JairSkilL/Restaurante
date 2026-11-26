import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { registerSchema } from '../utils/schemas';

async function main() {
  const { name, email, password } = registerSchema.parse({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  await connectDB();

  if (await User.exists({ email })) {
    console.log('Ya existe un usuario con ese correo; no se modificó');
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: 'admin' });
    console.log('Administrador creado');
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
