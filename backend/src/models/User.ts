import { Schema, model } from 'mongoose';

export const ROLES = ['admin', 'cliente'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'cliente', required: true },
    active: { type: Boolean, default: true },
    // Al cerrar sesión se incrementa y los tokens anteriores dejan de valer
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
