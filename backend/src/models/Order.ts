import { Schema, model } from 'mongoose';
import { ORDER_STATUSES } from '../utils/orderStatus';

// Se guarda nombre y precio del momento: el historial no cambia si se edita el plato
const itemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [itemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pendiente', required: true },
    type: { type: String, enum: ['delivery', 'recojo'], required: true },
    address: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true },
);

export const Order = model('Order', orderSchema);
