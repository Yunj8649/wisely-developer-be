import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { startOfDay, endOfDay } from 'date-fns';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { SearchType, QueryType, Pagination } from './interfaces/todo.interface';

@Injectable()
export class TodoService {
    constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}
    async create(createTodoDto: CreateTodoDto) {
        const [ maxTodo ] = await this.todoModel.find().select({ _id: 0, id: 1 }).sort({ id: -1 }).exec();

        const createdTodo = new this.todoModel({ id: maxTodo.id + 1, ...createTodoDto});
        return await createdTodo.save();
    }

    async findAll(querystring: SearchType): Promise<{data: Todo[]; pagination: Pagination}> {
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
                $lte: endOfDay(new Date(createdTo))
            } 
        }

        if (updatedFrom && updatedTo) {
            query.updatedAt = {
                $gte: startOfDay(new Date(updatedFrom)),
                $lte: endOfDay(new Date(updatedTo))
            } 
        }

        if ( isCompleted !== null && isCompleted !== undefined && typeof Boolean( isCompleted ) === 'boolean' ) {
            const isCompletedBool: boolean = isCompleted;
            query.isCompleted = isCompletedBool;
        }

        const result = await this.todoModel.find( query ).skip( skip ).limit( limit ).sort({ _id: -1 }).exec();
        const total = await this.todoModel.count( query ).exec();
        return {
            data: result,
            pagination: {
                page,
                limit,
                total
            }
        };
    }

    async findOne(id: number) {
        return await this.todoModel.findOne({ deletedAt: null, id }).exec();
    }

    async updateIsCompleted(id: number, isCompleted: boolean) {
        const todo = await this.todoModel.findOne({ deletedAt: null, id }).exec();
        if ( !todo ) {
            throw new HttpException({
                code: HttpStatus.NOT_FOUND,
                error: `TODO_${id}_NOT_FOUND`,
                message: 'todo??? ?????? ??? ????????????.',
            }, HttpStatus.NOT_FOUND);
        }

        if ( isCompleted ) {
            const refTodos = await this.todoModel.find({ id: { $in: todo.refIds }}).exec();
            const completedTodos = refTodos.filter(todo => todo.isCompleted);
            if ( completedTodos.length !== (todo.refIds).length ) {
                throw new HttpException({
                    code: HttpStatus.BAD_REQUEST,
                    error: 'REQUIRED_ALL_REFTODO_COMPLETED',
                    message: '????????? todo ??? ???????????? ?????? todo??? ????????????.',
                }, HttpStatus.BAD_REQUEST);
            }
        }

        if ( !isCompleted ) {
            const refTodos = await this.todoModel.find({ refIds: { $in: id }, isCompleted: true }).exec();
            if ( refTodos.length > 0 ) {
                throw new HttpException({
                    code: HttpStatus.BAD_REQUEST,
                    error: 'REQUIRED_ALL_REFTODO_COMPLETED',
                    message: '???????????? ?????? ????????? todo??? ????????????.',
                }, HttpStatus.BAD_REQUEST);
            }
        }

        return await this.todoModel.findOneAndUpdate(
            { id },
            { $set: { 
                isCompleted,
                updatedAt: new Date(),
            } },
        );
    }

    async update(id: number, updateTodoDto: UpdateTodoDto) {
        const todo = await this.todoModel.findOne({ deletedAt: null, id }).exec();
        if ( !todo ) {
            throw new HttpException({
                code: HttpStatus.NOT_FOUND,
                error: `TODO_${id}_NOT_FOUND`,
                message: 'todo??? ?????? ??? ????????????.',
            }, HttpStatus.NOT_FOUND);
        }
        const { contents = null, refIds } = updateTodoDto;

        if ( !contents?.length ) {
            throw new HttpException({
                code: HttpStatus.BAD_REQUEST,
                error: 'REQUIRED_CONTENTS',
                message: 'todo ????????? ??????????????????.',
            }, HttpStatus.BAD_REQUEST);
        }

        if ( refIds ) {
            let refIdsCheck = await this.refIdsValidation(todo.refIds, refIds);
            let message = '???????????? ?????? todo id??? ???????????? ????????????.';
            if (refIds.includes(id)) {
                message = '?????? id??? ?????? ??? ??? ????????????.';
                refIdsCheck = false;
            }
            if ( !refIdsCheck ) {
                throw new HttpException({
                    code: HttpStatus.BAD_REQUEST,
                    error: 'CHECK_REQUIRED_REF_IDS',
                    message,
                }, HttpStatus.BAD_REQUEST);
            }
        }

        return await this.todoModel.findOneAndUpdate(
            { id },
            { $set: { 
                ...updateTodoDto,
                updatedAt: new Date(),
            } },
            { new: true },
        );
    }

    async remove(id: number) {
        const refTodos = await this.todoModel.find({ refIds: { $in: id }, deletedAt: null }).exec();
        if ( refTodos.length > 0 ) {
            throw new HttpException({
                code: HttpStatus.BAD_REQUEST,
                error: 'IS_TODO_USE_REF_IDS',
                message: '?????? todo??? ????????? ?????? ???????????????.',
            }, HttpStatus.BAD_REQUEST);
        }
        const todo = await this.todoModel.findOne({ deletedAt: null, id });
        todo.set({ deletedAt: new Date()});
        return await todo.save();
        // return await this.todoModel.remove({ id }); // ?????? ?????? ??????
    }

    async refIdsValidation(refIds: number[], updateRefIds: number[]) {
        let pass = true;
        const diffRefIds = updateRefIds.filter(id=> !(refIds).includes(id));
        if ( diffRefIds.length !== 0 || (refIds.length !== updateRefIds.length)) {
            const refTodos = await this.todoModel.find({ id: { $in: updateRefIds }, deletedAt: null }).exec();
            if ( refTodos.length !== updateRefIds.length ) {
                pass = false;
            }
        }
        return pass;
    }
}
