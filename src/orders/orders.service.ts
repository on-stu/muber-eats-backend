import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entitiy';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly reataurants: Repository<Restaurant>,
  ) {}

  async createOrder(
    customer: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.reataurants.findOne({
      where: { id: createOrderInput.restaurantId },
    });
    if (!restaurant) {
      return {
        ok: false,
        error: 'restaurant not found',
      };
    }
    const order = await this.orders.save(
      this.orders.create({
        customer: customer,
        restaurant,
      }),
    );
    console.log(order);
    return {
      ok: true,
    };
  }
}
