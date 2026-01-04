const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Release tracking
    release: process.env.APP_VERSION || 'unknown',
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['x-api-key'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive query params
      if (event.request?.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/api_key=[^&]*/g, 'api_key=[REDACTED]')
          .replace(/token=[^&]*/g, 'token=[REDACTED]');
      }
      
      return event;
    },
  });

  // Request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  console.log('✅ Sentry error tracking initialized');
}

// Error handler must be before any other error middleware and after all controllers
function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors
      return true;
    },
  });
}

// Capture custom exceptions
function captureException(error, context = {}) {
  Sentry.captureException(error, {
    tags: context.tags || {},
    extra: context.extra || {},
    user: context.user || {},
  });
}

// Capture custom messages
function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags || {},
    extra: context.extra || {},
  });
}

// Add breadcrumb for debugging
function addBreadcrumb(category, message, data = {}) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

// Set user context
function setUser(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Clear user context (e.g., on logout)
function clearUser() {
  Sentry.setUser(null);
}

// Create transaction for performance monitoring
function startTransaction(name, op) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

module.exports = {
  initSentry,
  sentryErrorHandler,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  clearUser,
  startTransaction,
  Sentry,
};
