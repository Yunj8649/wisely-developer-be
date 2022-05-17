import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, versionKey: false })
export class Todo {
    @Prop({ required: true, unique: true })
    public id: number;

    @Prop()
    public contents: string;

    @Prop({default: false})
    public isCompleted: boolean;

    @Prop()
    public refIds: number[];

    @Prop()
    public deletedAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
