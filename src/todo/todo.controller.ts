import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './schemas/todo.schema';

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
    async findAll(): Promise<Todo[]> {
        console.log(this.config.get('MONGODB_URI'));
        return await this.todoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.todoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
        return this.todoService.update(+id, updateTodoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.todoService.remove(+id);
    }
}
