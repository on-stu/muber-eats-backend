import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService, OrderResolver],
  imports: [TypeOrmModule.forFeature([Order, Restaurant])],
})
export class OrdersModule {}
