import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entitiy';
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
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaruntInput,
  SearchRestaruntOutput,
} from './dtos/search-restuarant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaruantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  @Role([UserRole.Owner])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaruantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return await this.restaruantService.editRestaurant(
      authUser,
      editRestaurantInput,
    );
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner'])
  async deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaruantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly restaruantService: RestaurantService) {}

  @ResolveField((type) => Number)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaruantService.countRestaurants(category);
  }

  @Query((type) => AllCategoriesOutput)
  allCategories() {
    return this.restaruantService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaruantService.findCategoryBySlug(categoryInput);
  }

  @Query((type) => RestaurantsOutput)
  restaurants(@Args('input') restaurantsInput: RestaurantsInput) {
    return this.restaruantService.allRestaurants(restaurantsInput);
  }

  @Query((returns) => RestaurantOutput)
  restaurant(@Args('input') restaurantInput: RestaurantInput) {
    return this.restaruantService.findRestuarantById(restaurantInput);
  }

  @Query((returns) => SearchRestaruntOutput)
  searchRestaurant(
    @Args('input') searchRestuarantInput: SearchRestaruntInput,
  ): Promise<SearchRestaruntOutput> {
    return this.restaruantService.searchRestaurantByName(searchRestuarantInput);
  }
}

@Resolver((of) => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((type) => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }
}
