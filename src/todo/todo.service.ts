import { Injectable } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { SearchType, QueryType } from './interfaces/todo.interface';

@Injectable()
export class TodoService {
    constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}
    async create(createTodoDto: CreateTodoDto) {
        const [ maxTodo ] = await this.todoModel.find().select({ _id: 0, id: 1 }).sort({ id: -1 }).exec();

        const createdTodo = new this.todoModel({ id: maxTodo.id + 1, ...createTodoDto});
        return await createdTodo.save();
    }

    async findAll(querystring: SearchType): Promise<Todo[]> {
        const { 
            createdFrom, createdTo, 
            updatedFrom, updatedTo, 
            contents, isCompleted,
            page = 1, limit = 0
        } = querystring;

        let skip = 0;
        skip = ( page - 1 ) * limit;

        const query: QueryType = {
            deletedAt: null
        }
        if ( contents ) {
            const regExpContents = new RegExp( contents, 'gi' );
            query.contents = regExpContents;
        }

        if (createdFrom && createdTo) {
            query.createdAt = {
                $gte: startOfDay(new Date(createdFrom)),
                $lte: startOfDay(new Date(createdTo))
            } 
        }

        if (updatedFrom && updatedTo) {
            query.updatedAt = {
                $gte: startOfDay(new Date(updatedFrom)),
                $lte: startOfDay(new Date(updatedTo))
            } 
        }

        if ( isCompleted == true || isCompleted == false) {
            query.isCompleted = isCompleted;
        }

        const result = await this.todoModel.find( query ).skip( skip ).limit( limit ).sort({ _id: -1 }).exec();
        return result;
    }

    async findOne(id: number) {
        return await this.todoModel.findOne({ deletedAt: null, id }).exec();
    }

    async update(id: number, updateTodoDto: UpdateTodoDto) {
        return await this.todoModel.findOneAndUpdate(
            { id },
            { $set: { 
                updatedAt: new Date(),
                ...updateTodoDto 
            } },
            { new: true },
        );
    }

    async remove(id: number) {
        const todo = await this.todoModel.findOne({ deletedAt: null, id }).exec();
        todo.deletedAt = new Date();
        return await todo.save();
    }
}
