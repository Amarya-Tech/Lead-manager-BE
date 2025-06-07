export const errorHandler = (err, req, res, next) => {
    console.error("Error", err);

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not Found';
    }

    res.status(statusCode).json({ status: "failure", message: message });

};