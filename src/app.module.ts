import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import * as Joi from 'joi';

@Module({
    imports: [
        TodoModule,
        ConfigModule.forRoot({
            // 다른 모듈에서 imports 에 등록 안해도 constructor(config: ConfigService){} 이렇게 가져다 쓸 수 있도록 한다.
            isGlobal: true,
            // NODE_ENV 값이 production 일때 .env.production 파일을 읽도록 설정
            envFilePath: `.env${
                process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '.dev'
            }`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
                MONGODB_URI: Joi.string().required(),
                MONGODB_PORT: Joi.string().required(),
            }),
        }),
        // ConfigService 를 사용하기 위해 일반적으로 사용하는 MongooseModule.forRoot 대신 MongooseModule.forRootAsync 로 모듈을 가져온다.
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                uri: config.get('MONGODB_URI'),
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
