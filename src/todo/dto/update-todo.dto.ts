import { IsDate, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';

export class UpdateTodoDto extends PartialType(CreateTodoDto) {
    @IsDate()
    @IsOptional()
    readonly deletedAt: Date;
}
