import { Routes } from '@angular/router';
import { adminGuard, guestGuard } from '../guards/auth.guards';
import { DashboardComponent } from '../components/dashboard.component';
import { LoginComponent } from '../components/login.component';
import { OrdersComponent } from '../components/orders.component';
import { ProductsComponent } from '../components/products.component';
import { RegisterComponent } from '../components/register.component';
import { UsersComponent } from '../components/users.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'platos', component: ProductsComponent, canActivate: [adminGuard] },
  { path: 'pedidos', component: OrdersComponent, canActivate: [adminGuard] },
  { path: 'usuarios', component: UsersComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
