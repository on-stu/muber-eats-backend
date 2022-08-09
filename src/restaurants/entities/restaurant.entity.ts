import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: String;

  @Field((type) => Boolean, { defaultValue: true }) // for graphql
  @Column({ default: true }) //for db
  @IsOptional()
  @IsBoolean()
  isVegan: Boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  address: String;

  @Field((type) => String)
  @Column()
  @IsString()
  ownerName: String;

  @Field((type) => String, { nullable: true })
  @Column()
  @IsString()
  categoryName: String;
}
