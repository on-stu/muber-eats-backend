import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entitiy';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput {
  @Field((type) => String, { nullable: true })
  error?: String;

  @Field((type) => Boolean)
  ok: Boolean;
}
