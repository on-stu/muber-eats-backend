import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService, OrderResolver],
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
})
export class OrdersModule {}
