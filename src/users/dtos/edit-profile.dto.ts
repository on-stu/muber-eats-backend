import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entitiy';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

//PickType으로 엔티티에서 몇가지만 가지고 오고, PartialType으로 optional로 만들어줌
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
