import { Schema, model } from 'mongoose';

export const CATEGORIES = ['entrada', 'plato_principal', 'postre', 'bebida'] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    price: { type: Number, required: true, min: 0.1 },
    category: { type: String, enum: CATEGORIES, required: true },
    imageUrl: { type: String, default: '' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = model('Product', productSchema);
