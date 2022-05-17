import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema()
export class Todo {

    @Prop({required: true})
        id: number;

    @Prop()
        contents: string;

    @Prop({default: false})
        isCompleted: boolean;

    @Prop()
        refIds: number[];

    @Prop()
        deletedAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
