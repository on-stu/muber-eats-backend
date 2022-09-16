import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entitiy';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly reataurants: Repository<Restaurant>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.reataurants.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return {
        ok: false,
        error: 'restaurant not found',
      };
    }
    items.forEach(async (item) => {
      const dish = await this.dishes.findOne({ where: { id: item.dishId } });
      if (!dish) {
        //abort this whole thing
      }
      await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        }),
      );
    });
    // const order = await this.orders.save(
    //   this.orders.create({
    //     customer: customer,
    //     restaurant,
    //   }),
    // );
    // console.log(order);
    return {
      ok: true,
    };
  }
}
