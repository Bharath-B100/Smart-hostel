const Joi = require('joi');

// Validation schemas
const schemas = {
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),
        isAdmin: Joi.boolean().optional()
    }),

    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name must not exceed 100 characters',
            'any.required': 'Name is required'
        }),
        room: Joi.string().required().messages({
            'any.required': 'Room number is required'
        }),
        hostelType: Joi.string().valid('boys').required().messages({
            'any.only': 'Hostel type must be boys',
            'any.required': 'Hostel type is required'
        }),
        hostelName: Joi.string().required().messages({
            'any.required': 'Hostel name is required'
        })
    }),

    feedback: Joi.object({
        user: Joi.string().required(),
        email: Joi.string().email().required(),
        mealType: Joi.string().valid('breakfast', 'lunch', 'snacks', 'dinner').required(),
        foodRating: Joi.number().min(1).max(5).required(),
        comments: Joi.string().max(500).allow('').optional()
    }),

    leave: Joi.object({
        user: Joi.string().required(),
        email: Joi.string().email().required(),
        type: Joi.string().valid('sick', 'personal', 'emergency', 'other').required(),
        from: Joi.date().required(),
        to: Joi.date().required().min(Joi.ref('from')),
        reason: Joi.string().max(500).required()
    }),

    student: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        roll: Joi.string().pattern(/^[0-9]{2}[A-Z]{2}[0-9]{3}$/i).required(),
        email: Joi.string().email().required(),
        room: Joi.string().required(),
        department: Joi.string().required(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).optional()
    }),

    report: Joi.object({
        user: Joi.string().required(),
        email: Joi.string().email().required(),
        category: Joi.string().valid('Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Internet', 'Security', 'Other').required(),
        location: Joi.string().required(),
        description: Joi.string().max(1000).required(),
        urgency: Joi.string().valid('low', 'medium', 'high', 'critical').required()
    }),

    roomAllocation: Joi.object({
        studentId: Joi.string().required(),
        studentName: Joi.string().required(),
        roomNumber: Joi.string().required(),
        hostelName: Joi.string().required(),
        allocationDate: Joi.date().required()
    }),

    attendance: Joi.object({
        studentId: Joi.string().required(),
        studentName: Joi.string().required(),
        date: Joi.date().required(),
        status: Joi.string().valid('present', 'absent', 'late').required(),
        type: Joi.string().valid('morning', 'evening', 'night').required(),
        recordedBy: Joi.string().required()
    }),

    visitor: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
        purpose: Joi.string().required(),
        studentVisiting: Joi.string().required(),
        expectedDuration: Joi.number().min(1).required()
    }),

    payment: Joi.object({
        studentId: Joi.string().required(),
        studentName: Joi.string().required(),
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('hostel', 'mess', 'other', 'hostel_fee', 'mess_fee', 'security_deposit').required(),
        method: Joi.string().valid('cash', 'online', 'cheque').required(),
        date: Joi.date().required()
    })
};

// Validation middleware factory
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({
                success: false,
                error: 'Invalid validation schema'
            });
        }

        const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        req.body = value;
        next();
    };
};

module.exports = {
    validate,
    schemas
};
