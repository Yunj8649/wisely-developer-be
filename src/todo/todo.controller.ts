import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './schemas/todo.schema';
import { SearchType, Pagination } from './interfaces/todo.interface';

@Controller('todo')
export class TodoController {
    constructor(
        private readonly todoService: TodoService,
        private readonly config: ConfigService, // ConfigService 불러오기
    ) {}

    @Post()
    create(@Body() createTodoDto: CreateTodoDto) {
        return this.todoService.create(createTodoDto);
    }

    @Get()
    async findAll(@Query() querystring: SearchType): Promise<{data: Todo[]; pagination: Pagination}> {
        return await this.todoService.findAll(querystring);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.todoService.findOne(+id);
    }

    @Post(':id')
    update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
        return this.todoService.update(+id, updateTodoDto);
    }

    @Patch(':id')
    updateIsCompleted(@Param('id') id: string, @Query('isCompleted') isCompleted: boolean) {
        return this.todoService.updateIsCompleted(+id, isCompleted);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.todoService.remove(+id);
    }
}
