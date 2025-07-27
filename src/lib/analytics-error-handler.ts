// Structured Logging Framework
// Implementation per .cursor structured logging rules

import { ApplicationError, isApplicationError } from './errors';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  operation: string;
  traceId: string;
  userId?: string;
  chamberId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

export interface LogContext {
  userId?: string;
  chamberId?: string;
  businessId?: string;
  eventId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  private isProduction = import.meta.env.PROD;
  private currentTraceId: string | null = null;
  private currentUserId: string | null = null;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setTraceId(traceId: string): void {
    this.currentTraceId = traceId;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  private getCurrentTraceId(): string {
    return this.currentTraceId || `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    return this.currentUserId || undefined;
  }

  private sanitizeLogContext(context: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = [
      'password', 'token', 'apikey', 'secret', 'auth', 'credential',
      'ssn', 'creditcard', 'cvv', 'pin', 'authorization', 'bearer',
      'refresh_token', 'access_token', 'session_token', 'api_key'
    ];
    
    const sanitized = { ...context };
    
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
      
      // Redact email addresses in production
      if (this.isProduction && typeof sanitized[key] === 'string') {
        const value = sanitized[key] as string;
        if (value.includes('@') && value.includes('.')) {
          sanitized[key] = '[EMAIL_REDACTED]';
        }
      }
    }
    
    return sanitized;
  }

  private serializeError(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: error.message,
      stack: this.isProduction ? undefined : error.stack,
      cause: error.cause ? this.serializeError(error.cause as Error) : undefined
    };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    operation: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      operation,
      traceId: this.getCurrentTraceId(),
      userId: context?.userId || this.getCurrentUserId(),
      chamberId: context?.chamberId,
      context: context ? this.sanitizeLogContext(context) : undefined
    };

    if (error) {
      entry.error = this.serializeError(error);
    }

    return entry;
  }

  private outputLog(entry: LogEntry): void {
    if (this.isProduction) {
      // In production, send to analytics service
      this.sendToAnalytics(entry);
    } else {
      // In development, use console with color coding
      const colorMap = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[90m'  // Gray
      };
      
      const reset = '\x1b[0m';
      const color = colorMap[entry.level];
      
      console.log(`${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`, {
        operation: entry.operation,
        traceId: entry.traceId,
        ...(entry.context || {}),
        ...(entry.error ? { error: entry.error } : {})
      });
    }
  }

  private async sendToAnalytics(entry: LogEntry): Promise<void> {
    try {
      // In a real application, this would send to your analytics service
      // For now, we'll use a mock implementation
      await fetch('/api/analytics/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to console if analytics service fails
      console.error('Failed to send log to analytics:', error);
      console.log(JSON.stringify(entry, null, 2));
    }
  }

  error(message: string, operation: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry('error', message, operation, context, error);
    this.outputLog(entry);
  }

  warn(message: string, operation: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, operation, context);
    this.outputLog(entry);
  }

  info(message: string, operation: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, operation, context);
    this.outputLog(entry);
  }

  debug(message: string, operation: string, context?: LogContext): void {
    if (!this.isProduction) {
      const entry = this.createLogEntry('debug', message, operation, context);
      this.outputLog(entry);
    }
  }
}

// Singleton instance
export const logger = Logger.getInstance();

// Error reporting function for application errors
export function reportError(
  error: ApplicationError | Error,
  context?: LogContext
): void {
  if (isApplicationError(error)) {
    logger.error(
      error.message,
      error.operation,
      {
        ...context,
        traceId: error.traceId,
        errorType: error.name,
        errorContext: error.context
      },
      error.cause
    );
  } else {
    logger.error(
      error.message,
      'unknown-operation',
      context,
      error
    );
  }
}

// Performance monitoring with thresholds
export async function logSlowOperation<T>(
  operation: string,
  threshold: number,
  task: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await task();
    const duration = performance.now() - startTime;
    
    if (duration > threshold) {
      logger.warn(
        `Slow operation detected: ${duration.toFixed(2)}ms`,
        operation,
        {
          ...context,
          duration,
          threshold,
          performance: 'slow'
        }
      );
    } else {
      logger.debug(
        `Operation completed: ${duration.toFixed(2)}ms`,
        operation,
        {
          ...context,
          duration,
          performance: 'normal'
        }
      );
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(
      `Operation failed after ${duration.toFixed(2)}ms`,
      operation,
      {
        ...context,
        duration,
        performance: 'failed'
      },
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// Business analytics tracking
export function trackBusinessAction(
  action: string,
  context: LogContext & {
    businessId?: string;
    chamberId?: string;
    value?: number;
    category?: string;
  }
): void {
  logger.info(
    `Business action: ${action}`,
    'business-analytics',
    {
      ...context,
      actionType: action,
      analytics: true
    }
  );
}

// User interaction tracking
export function trackUserInteraction(
  interaction: string,
  context: LogContext & {
    element?: string;
    page?: string;
    duration?: number;
  }
): void {
  logger.info(
    `User interaction: ${interaction}`,
    'user-analytics',
    {
      ...context,
      interactionType: interaction,
      analytics: true
    }
  );
}

// Security event logging
export function logSecurityEvent(
  event: string,
  context: LogContext & {
    severity: 'low' | 'medium' | 'high' | 'critical';
    userAgent?: string;
    ipAddress?: string;
    attemptedAction?: string;
  }
): void {
  logger.error(
    `Security event: ${event}`,
    'security-monitoring',
    {
      ...context,
      securityEvent: event,
      security: true
    }
  );
}

// GDPR compliance logging
export function logDataProcessing(
  operation: string,
  context: LogContext & {
    dataType: string;
    lawfulBasis: string;
    retention?: string;
    consent?: boolean;
  }
): void {
  logger.info(
    `Data processing: ${operation}`,
    'gdpr-compliance',
    {
      ...context,
      compliance: true
    }
  );
} 