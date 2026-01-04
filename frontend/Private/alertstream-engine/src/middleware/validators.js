const Joi = require('joi');

const ingestSchema = Joi.object({
  event_type: Joi.string().required().max(50),
  site_id: Joi.string().uuid().optional(),
  timestamp: Joi.string().isoDate().optional(),
  metadata: Joi.object().optional()
});

const triggerSchema = Joi.object({
  website_id: Joi.string().uuid().required(),
  event_type: Joi.string().required().max(50),
  is_active: Joi.boolean().default(true)
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  phone_number: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  monthly_sms_limit: Joi.number().integer().min(0).default(100)
});

function validateIngest(req, res, next) {
  const { error, value } = ingestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
}

function validateTrigger(req, res, next) {
  const { error, value } = triggerSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
}

function validateUser(req, res, next) {
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  
  req.body = value;
  next();
}

module.exports = {
  validateIngest,
  validateTrigger,
  validateUser,
  ingestSchema,
  triggerSchema,
  userSchema
};
