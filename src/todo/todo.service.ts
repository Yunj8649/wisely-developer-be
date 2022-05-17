import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodoService {
    constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}
    create(createTodoDto: CreateTodoDto) {
        return 'This action adds a new todo';
    }

    async findAll(): Promise<Todo[]> {
        const mongoose = require('mongoose');
        mongoose.set('debug', true)
        console.log('11')
        const aa = await this.todoModel.find().exec();
        console.log('aa : ',aa)
        return aa;
    }

    findOne(id: number) {
        return `This action returns a #${id} todo`;
    }

    update(id: number, updateTodoDto: UpdateTodoDto) {
        return `This action updates a #${id} todo`;
    }

    remove(id: number) {
        return `This action removes a #${id} todo`;
    }
}
