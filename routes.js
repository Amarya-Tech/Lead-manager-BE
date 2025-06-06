import userRoutes from './v1/users/routes/userRoutes.js';
import leadRoutes from './v1/leads/routes/leadRoutes.js';

export const setupRoutes = (app) => {
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/lead', leadRoutes);

    app.use('/', (req, res) => {
      res.status(403).json({
        statusCode: 403,
        status: 'failure',
        message: 'Invalid API'
      });
    });
};