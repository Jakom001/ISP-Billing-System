import Joi from 'joi';

const registerSchema = Joi.object({
    firstName: Joi.string().required().min(3),
    lastName: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    // password: Joi.string().min(8).required(),
    phone: Joi.string().min(10).required(),
    password: Joi.string()
    .min(8) // Minimum length
    .max(30) // Maximum length
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$')) // Pattern to ensure complexity
    .required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters long',
      'string.max': 'Password must not exceed {#limit} characters',
      'string.pattern.base': 'Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'Password is required',
    }),
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
})

const acceptCodeSchema = Joi.object({
    email: Joi.string().email().required(),
    providedCode: Joi.number().required(),
})
const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
    .min(8) // Minimum length
    .max(30) // Maximum length
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$')) // Pattern to ensure complexity
    .required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters long',
      'string.max': 'Password must not exceed {#limit} characters',
      'string.pattern.base': 'Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ "any.only": "Passwords must match" }),
})

const acceptFPSchema = Joi.object({
    email: Joi.string().email().required(),
    providedCode: Joi.number().required(),
    newPassword: Joi.string()
    .min(8) // Minimum length
    .max(30) // Maximum length
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$')) // Pattern to ensure complexity
    .required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters long',
      'string.max': 'Password must not exceed {#limit} characters',
      'string.pattern.base': 'Password must include at least one lowercase letter, one uppercase letter, one digit, and one special character',
      'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ "any.only": "Passwords must match" }),
})

const enterpriseSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().allow('').optional(),
    industry: Joi.string().required(),
    website: Joi.string().uri().allow('').optional(),
    noStaff: Joi.number().allow('').optional(),
    yearsExistence: Joi.number().allow('').optional(),
    phone: Joi.number().allow('').optional(),
    email: Joi.string().email().required(),
    city: Joi.string().required(),
})

const categorySchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('').optional(),
})

const projectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow("").optional(),
    categoryId:Joi.string().required()
})

const taskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null).optional(),
    note: Joi.string().allow('', null).optional(),
    projectId: Joi.string().required(),
    startTime: Joi.date().allow('', null).optional(),
    endTime: Joi.date().allow('', null).optional(),
})

const featureSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('feature','bugFix', 'improvement', 'other'),
    priority:Joi.string().valid('High', 'Medium', 'Low'),
    status:Joi.string().valid('Pending', 'Completed'),
    image:Joi.string().allow('').optional(),
    description:Joi.string().allow('').optional(),
})

const ticketSchema = Joi.object({
    name: Joi.string().required(),
    priority:Joi.string().valid('High', 'Medium', 'Low'),
    status:Joi.string().valid("Open", "Close"),
    image:Joi.string().allow('').optional(),
    description:Joi.string().allow('').optional(),
    assigned: Joi.string().required(),
})
const traineeSchema = Joi.object({
    firstName: Joi.string().required().min(3),
    lastName: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).required(),
    position: Joi.string().valid("ceo", "director", "senior Management", "middle Management", "technical level", "others"),
    gender: Joi.string().valid('Male', 'Female'),
    ageBracket: Joi.string().valid("18-35", "36-45", "45-60", "Above 60"),
    enterpriseId: Joi.string().required(),
})

const sessionSchema = Joi.object({
    enterpriseId: Joi.string().required(),
    name: Joi.string().required(),
    objectives: Joi.string().allow('').optional(),
    attendanceSheetImage: Joi.string().allow("").optional(),
    duration: Joi.number().positive().required(),
    rating: Joi.number().min(1).max(5).required(),
    date: Joi.date().required(),
    actionPhotos: Joi.array().items(Joi.string()).default([]),
    workingToolsPhotos: Joi.array().items(Joi.string()).default([]),
    outcome: Joi.string().allow("").optional(),
    comment: Joi.string().allow("").optional(),
})

const companyValidator = Joi.object({
    companyName: Joi.string().required(),
    industry: Joi.string().required(),
    website: Joi.string().uri().required(),
    logo: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    description: Joi.string().required(),
})
const minuteSchema = Joi.object({
    name: Joi.string().required(),
    date:Joi.date().required(),
    discussion: Joi.string().required(),
    members: Joi.string().required(),
    suggestion: Joi.string().allow("").optional(),
})

export{
    registerSchema,
    loginSchema,
    acceptCodeSchema,
    changePasswordSchema,
    acceptFPSchema,
    companyValidator,
    enterpriseSchema,
    projectSchema,
    taskSchema,
    featureSchema,
    categorySchema,
    traineeSchema,
    sessionSchema,
    ticketSchema, minuteSchema
};

