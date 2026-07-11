import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { serverEnv } from "@repo/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(serverEnv.port);
}
bootstrap();
