// Core Error Handling Framework
// Implementation of 4-tier error classification system per .cursor rules

export interface BaseError {
  readonly name: string;
  readonly message: string;
  readonly operation: string;
  readonly traceId: string;
  readonly timestamp: Date;
  readonly cause?: Error;
}

export interface ValidationErrorContext {
  field?: string;
  value?: unknown;
  expected?: string;
  received?: string;
}

export interface DomainErrorContext {
  code: string;
  context: Record<string, unknown>;
  userId?: string;
  chamberId?: string;
}

export interface InfrastructureErrorContext {
  service: string;
  endpoint?: string;
  statusCode?: number;
  retryAttempt?: number;
}

export interface ThirdPartyErrorContext {
  provider: string;
  apiVersion?: string;
  requestId?: string;
  rateLimited?: boolean;
}

// Validation Errors: Input validation, schema validation, type mismatches
export class ValidationError extends Error implements BaseError {
  public readonly name = 'ValidationError';
  public readonly operation: string;
  public readonly traceId: string;
  public readonly timestamp: Date;
  public readonly cause?: Error;
  public readonly context: ValidationErrorContext;

  constructor(
    message: string,
    operation: string,
    context: ValidationErrorContext = {},
    cause?: Error
  ) {
    super(message);
    this.operation = operation;
    this.traceId = generateTraceId();
    this.timestamp = new Date();
    this.cause = cause;
    this.context = context;
    
    // Set prototype for proper instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Domain Errors: Business logic violations, state conflicts, authorization failures
export class DomainError extends Error implements BaseError {
  public readonly name = 'DomainError';
  public readonly operation: string;
  public readonly traceId: string;
  public readonly timestamp: Date;
  public readonly cause?: Error;
  public readonly context: DomainErrorContext;

  constructor(
    message: string,
    operation: string,
    context: DomainErrorContext,
    cause?: Error
  ) {
    super(message);
    this.operation = operation;
    this.traceId = generateTraceId();
    this.timestamp = new Date();
    this.cause = cause;
    this.context = context;
    
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

// Infrastructure Errors: Database connections, network timeouts, file system issues
export class InfrastructureError extends Error implements BaseError {
  public readonly name = 'InfrastructureError';
  public readonly operation: string;
  public readonly traceId: string;
  public readonly timestamp: Date;
  public readonly cause?: Error;
  public readonly context: InfrastructureErrorContext;

  constructor(
    message: string,
    operation: string,
    context: InfrastructureErrorContext,
    cause?: Error
  ) {
    super(message);
    this.operation = operation;
    this.traceId = generateTraceId();
    this.timestamp = new Date();
    this.cause = cause;
    this.context = context;
    
    Object.setPrototypeOf(this, InfrastructureError.prototype);
  }
}

// Third-party Errors: External API failures, service unavailability
export class ThirdPartyError extends Error implements BaseError {
  public readonly name = 'ThirdPartyError';
  public readonly operation: string;
  public readonly traceId: string;
  public readonly timestamp: Date;
  public readonly cause?: Error;
  public readonly context: ThirdPartyErrorContext;

  constructor(
    message: string,
    operation: string,
    context: ThirdPartyErrorContext,
    cause?: Error
  ) {
    super(message);
    this.operation = operation;
    this.traceId = generateTraceId();
    this.timestamp = new Date();
    this.cause = cause;
    this.context = context;
    
    Object.setPrototypeOf(this, ThirdPartyError.prototype);
  }
}

// Union type for all application errors
export type ApplicationError = ValidationError | DomainError | InfrastructureError | ThirdPartyError;

// Result Type Pattern for TypeScript Logic Rules
export type Result<T, E = ApplicationError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Error classification helper
export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ValidationError ||
         error instanceof DomainError ||
         error instanceof InfrastructureError ||
         error instanceof ThirdPartyError;
}

// Safe error conversion for unknown errors
export function toApplicationError(
  error: unknown,
  operation: string,
  defaultType: 'validation' | 'domain' | 'infrastructure' | 'third-party' = 'infrastructure'
): ApplicationError {
  if (isApplicationError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const cause = error instanceof Error ? error : undefined;

  switch (defaultType) {
    case 'validation':
      return new ValidationError(message, operation, {}, cause);
    case 'domain':
      return new DomainError(message, operation, { code: 'UNKNOWN', context: {} }, cause);
    case 'third-party':
      return new ThirdPartyError(message, operation, { provider: 'unknown' }, cause);
    default:
      return new InfrastructureError(message, operation, { service: 'unknown' }, cause);
  }
}

// Result helpers
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// Async Result type
export type AsyncResult<T, E = ApplicationError> = Promise<Result<T, E>>;

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  operationName: string,
  errorType: 'validation' | 'domain' | 'infrastructure' | 'third-party' = 'infrastructure'
): AsyncResult<T> {
  try {
    const data = await operation();
    return ok(data);
  } catch (error) {
    return err(toApplicationError(error, operationName, errorType));
  }
} 