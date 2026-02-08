import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { Logger as PinoLogger } from "nestjs-pino";
import helmet from "helmet";
import * as express from "express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger
  app.useLogger(app.get(PinoLogger));

  // 安全標頭設置
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 年
        includeSubDomains: true,
        preload: true,
      },
      // 禁止點擊劫持
      frameguard: { action: "deny" },
      // 禁止 MIME 類型嗅探
      noSniff: true,
      // XSS 過濾器
      xssFilter: true,
      // 隱藏 X-Powered-By 標頭
      hidePoweredBy: true,
    }),
  );

  // 請求體大小限制
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Enable CORS - 使用環境變數控制允許的來源
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : [process.env.FRONTEND_URL || "http://localhost:3000"];

  // 開發環境允許額外的本地端口
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:3001", "http://localhost:3002");
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");

  const logger = new Logger("Bootstrap");
  logger.log(`Clinic OS API running on http://0.0.0.0:${port}/api`);
}

bootstrap();
