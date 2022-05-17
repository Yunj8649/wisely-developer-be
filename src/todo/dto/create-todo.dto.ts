import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTodoDto {
    @IsString()
    readonly contents: string;

    @IsBoolean()
    readonly isCompleted: boolean;

    @IsOptional()
    readonly refIds: number[];
}
