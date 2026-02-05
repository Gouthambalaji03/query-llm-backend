import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swagger_ui from 'swagger-ui-express';
import { env } from '@/config/env';
import { connect_database } from '@/config/database';
import { swagger_spec } from '@/config/swagger';
import user_routes from '@/routes/user';
import auth_routes from '@/routes/auth';
import conversation_routes from '@/routes/conversation';
import { http_logger } from '@/middlewares/http_logger';
import { error_middleware, not_found_middleware } from '@/middlewares/error_middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request/response logging
app.use(http_logger);

// Swagger documentation
app.use('/api-docs', swagger_ui.serve, swagger_ui.setup(swagger_spec));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/auth', auth_routes);
app.use('/api/users', user_routes);
app.use('/api/conversations', conversation_routes);

// 404 handler
app.use(not_found_middleware);

// Global error handler
app.use(error_middleware);

// Start server
const start_server = async (): Promise<void> => {
  try {
    await connect_database();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start_server();

export default app;
