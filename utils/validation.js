import { body, query, check, param } from 'express-validator';

const passwordValidation = (value) => {
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one special character.');
    }
    return true;
};

export const userRegVal = [
    body('first_name').notEmpty().withMessage('First name cannot be empty.').isString().withMessage("First name must be a string."),
    body('last_name').notEmpty().withMessage('Last name cannot be empty.').isString().withMessage("Last name must be a string."),
    body('email').isEmail().withMessage('Invalid email input.').notEmpty().withMessage('Email cannot be empty.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').notEmpty().withMessage('Password cannot be empty.').custom(passwordValidation),
    body('phone')
        .optional()
        .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits.')
        .matches(/^\d+$/).withMessage('Phone number must contain only digits.'),
    body('role').notEmpty().withMessage('Role cannot be empty.')
]

export const userLogVal = [
    body('email').notEmpty().withMessage('Email cannot be empty.'),
    body('password').notEmpty().withMessage('Password cannot be empty.')
]

export const logOutVal = [
    param('id').notEmpty().withMessage('id cannot be empty.')
]

export const setUserStatusVal = [
    body('id').notEmpty().withMessage('Id cannot be empty.').isUUID().withMessage('Invalid UUID format.'),
    body('is_active').notEmpty().withMessage('Status cannot be empty.').isBoolean().withMessage('Status must be a boolean value (true or false).')
]

export const setUserRoleVal = [
    body('id').notEmpty().withMessage('Id cannot be empty.').isUUID().withMessage('Invalid UUID format.'),
    body('role').notEmpty().withMessage('Role cannot be empty.').isString().withMessage("Role must be a string.")
]

export const createLeadVal = [
    body('company_name').notEmpty().withMessage('Company name cannot be empty.').isString().withMessage("Company name must be a string."),
    body('product').optional().notEmpty().withMessage('Product cannot be empty.').isString().withMessage("Product must be a string."),
    body('industry_type').notEmpty().withMessage('Industry type cannot be empty.'),
    body('export_value').optional().isInt().withMessage("Export Value must be a number."),
    body('insured_amount').optional().isInt().withMessage("Insured Amount must be a number."),
    param('id').notEmpty().withMessage('id cannot be empty.')
]

export const addLeadOfcVal = [
    body('lead_id').notEmpty().withMessage('Lead Id cannot be empty.').isUUID().withMessage('Lead Id must be a valid UUID.'),
    body('address').notEmpty().withMessage('Address cannot be empty.').isString().withMessage("Address must be a string."),
    body('city').notEmpty().withMessage('City cannot be empty.').isString().withMessage("City must be a string."),
    body('district').notEmpty().withMessage('District cannot be empty.').isString().withMessage("District must be a string."),
    body('country').notEmpty().withMessage('Country cannot be empty.').isString().withMessage("Country must be a string."),
    body('postal_code').notEmpty().withMessage('Postal Code cannot be empty.').isInt().withMessage('Postal code should be an integer')
]

export const addLeadContactVal = [
    body('lead_id').notEmpty().withMessage('Lead Id cannot be empty.').isUUID().withMessage('Lead Id must be a valid UUID.'),
    body('name').notEmpty().withMessage('Name cannot be empty.').isString().withMessage("Name must be a string."),
    body('phone').optional().isInt().withMessage('Phone number should be an integer').isLength({ min: 10, max: 10 }).withMessage('Phone number must be of 10 digits.'),
    body('alt_phone').optional().isInt().withMessage('Phone number should be an integer').isLength({ min: 10, max: 10 }).withMessage('Phone number must be of 10 digits.'),
    body('email').optional({ checkFalsy: true })
    .isEmail().withMessage('Invalid email input.'),
]

export const updateLeadVal = [
     param('lead_id').notEmpty().withMessage('Lead id cannot be empty.')
]

export const updateLeadOfcVal = [
     param('lead_id').notEmpty().withMessage('Lead id cannot be empty.'),
     param('office_id').notEmpty().withMessage('Office id cannot be empty.')
]

export const updateLeadContactVal = [
     param('lead_id').notEmpty().withMessage('Lead id cannot be empty.'),
     param('contact_id').notEmpty().withMessage('Contact id cannot be empty.')
]

export const addAssigneeVal = [
    body('lead_id').notEmpty().withMessage('Lead Id cannot be empty.').isUUID().withMessage('Lead Id must be a valid UUID.'),
    body('assignee_id').notEmpty().withMessage('Assignee Id cannot be empty.').isUUID().withMessage('Assignee Id must be a valid UUID.'),
    body('description').optional().isString().withMessage("Description must be a string.")
]

export const addCommnentVal = [
    param('id').notEmpty().withMessage('User id cannot be empty.'),
    param('lead_id').notEmpty().withMessage('Lead id cannot be empty.'),
    body('comment').notEmpty().withMessage('Comment cannot be empty.').isString().withMessage("Comment must be a string.")
]