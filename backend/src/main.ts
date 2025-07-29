import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const document = SwaggerModule.createDocument(app, config);

  const OpenApiSpecification = app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
