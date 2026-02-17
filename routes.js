import tenantRoutes from './v1/tenant/routes/tenantRoutes.js'
import userRoutes from './v1/users/routes/userRoutes.js';
import leadRoutes from './v1/leads/routes/leadRoutes.js';
import leadCommunicationRoutes from './v1/leadCommunications/routes/leadCommunicationRoutes.js';

export const setupRoutes = (app) => {
    app.use('/api/v1/tenant' , tenantRoutes)
    app.use('/api/v1/user', userRoutes);
    app.use('/api/v1/lead', leadRoutes);
    app.use('/api/v1/lead-com', leadCommunicationRoutes);

    app.use('/', (req, res) => {
      res.status(403).json({
        statusCode: 403,
        status: 'failure',
        message: 'Invalid API'
      });
    });
};