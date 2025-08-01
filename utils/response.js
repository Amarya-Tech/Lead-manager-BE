export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
};
export const minorErrorResponse = (res, data, message = 'Success', statusCode = 201) => {
    return res.status(statusCode).json({ success: false, message, data });
};
export const notFoundResponse = (res, data, message = 'Not Found', statusCode = 404) => {
    return res.status(statusCode).json({ success: false, message, data });
};
export const unAuthorizedResponse = (res, data, message = 'Not Authorized', statusCode = 401) => {
    return res.status(statusCode).json({ success: false, message, data });
};
export const errorResponse = (res, errors, message = 'Error has occured, please try again', statusCode = 400) => {
    return res.status(statusCode).json({ success: false, message, errors });
};
export const internalServerErrorResponse = (res, errors, message = 'Something went wrong, Please try again', statusCode = 500) => {
    errors = String(errors)
    return res.status(statusCode).send({ success: false, message, errors });
}; 