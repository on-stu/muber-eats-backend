import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entitiy';
import { ILike, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaruntInput,
  SearchRestaruntOutput,
} from './dtos/search-restuarant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  private async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase(); // 앞뒤 빈칸 지워줌, 그리고 소문자로
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.category.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.category.save(
        this.category.create({
          slug: categorySlug,
          name: categoryName,
        }),
      );
    }
    return category;
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    // const newRestaurant = new Restaurant()
    // newRestaurant.name = CreateRestaurantInput.name
    // 이건 너무 귀찮음
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      console.log(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
        loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'not authrized',
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.getOrCreateCategory(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save(
        this.restaurants.create([
          {
            id: editRestaurantInput.restaurantId,
            ...editRestaurantInput,
            ...(category && { category }),
          },
        ]),
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: deleteRestaurantInput.restaurantId },
        loadRelationIds: true,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'not authrized',
        };
      }
      await this.restaurants.delete(deleteRestaurantInput.restaurantId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.category.find();
      return {
        ok: true,
        categories: categories,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ where: { category: { id: category.id } } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.category.findOne({
        where: { slug },
        relations: ['restaurants'],
      });
      if (!category) {
        return {
          ok: false,
          error: 'Can not find category',
        };
      }
      const restaurants = await this.restaurants.find({
        where: {
          category: {
            id: category.id,
          },
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        totalPages: Math.ceil(totalResults / 25),
        restaurants,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async findRestuarantById(restaurantInput: RestaurantInput) {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantInput.restaurantId },
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Not Found',
        };
      }
      return {
        ok: true,
        restaurant: restaurant,
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaruntInput): Promise<SearchRestaruntOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: ILike(`%${query}%`) },
        take: 25,
        skip: (page - 1) * 25,
      });
      if (!restaurants) {
        return {
          ok: false,
          error: 'Not Found',
        };
      }
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: createDishInput.restaurantId },
    });
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }
    if (owner.id !== restaurant.ownerId) {
      return {
        ok: false,
        error: 'You Cannot Do that',
      };
    }
    try {
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
