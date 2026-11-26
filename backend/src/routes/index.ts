import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller';
import * as dashboard from '../controllers/dashboard.controller';
import * as orders from '../controllers/order.controller';
import * as products from '../controllers/product.controller';
import * as users from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const admin = [requireAuth, requireRole('admin')];
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Demasiados intentos; espera unos minutos' },
});

router.post('/auth/register', authLimit, auth.register);
router.post('/auth/login', authLimit, auth.login);
router.get('/auth/me', requireAuth, auth.me);
router.post('/auth/logout', requireAuth, auth.logout);

router.get('/products', products.listMenu);
router.get('/products/admin', admin, products.listAll); // antes de /:id
router.get('/products/:id', products.getProduct);
router.post('/products', admin, products.createProduct);
router.put('/products/:id', admin, products.updateProduct);
router.delete('/products/:id', admin, products.deleteProduct);

router.post('/orders', requireAuth, requireRole('cliente'), orders.createOrder);
router.get('/orders', requireAuth, orders.listOrders);
router.get('/orders/:id', requireAuth, orders.getOrder);
router.patch('/orders/:id/status', requireAuth, orders.changeStatus);

router.get('/users', admin, users.listUsers);
router.patch('/users/:id', admin, users.updateUser);
router.delete('/users/:id', admin, users.deactivateUser);

router.get('/dashboard', admin, dashboard.getSummary);

export default router;
