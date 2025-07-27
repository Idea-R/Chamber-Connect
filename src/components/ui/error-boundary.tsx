// React Error Boundary Implementation
// Per .cursor react-components rules

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { reportError } from '@/lib/analytics-error-handler';
import { toApplicationError } from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  operation?: string;
  retryable?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Report error to analytics system
    const applicationError = toApplicationError(
      error,
      this.props.operation || 'component-render',
      'infrastructure'
    );

    reportError(applicationError, {
      component: errorInfo.componentStack?.split('\n')[1]?.trim(),
      errorBoundary: true,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary
      }
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
        errorId: ''
      }));
    }
  };

  goHome = (): void => {
    window.location.href = '/dashboard';
  };

  refreshPage = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900 mt-3">
                Something went wrong
              </CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error ID for support */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  Error ID: <code className="font-mono">{this.state.errorId}</code>
                </p>
              </div>

              {/* Error details (only in development or if explicitly enabled) */}
              {(this.props.showDetails || !import.meta.env.PROD) && this.state.error && (
                <details className="bg-red-50 p-3 rounded-md">
                  <summary className="text-sm font-medium text-red-700 cursor-pointer">
                    Technical Details
                  </summary>
                  <div className="mt-2 text-sm text-red-600">
                    <p className="font-mono">{this.state.error.name}: {this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {this.props.retryable && this.state.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.retry}
                    variant="default"
                    className="flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.goHome}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  onClick={this.refreshPage}
                  variant="ghost"
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              </div>

              {/* Support information */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  If this problem persists, please contact support with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    const applicationError = toApplicationError(error, 'hook-error-handler', 'infrastructure');
    
    reportError(applicationError, {
      hookErrorHandler: true,
      errorInfo
    });
    
    throw error; // Re-throw to be caught by nearest Error Boundary
  };
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    operation?: string;
    retryable?: boolean;
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `async_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidMount(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    const applicationError = toApplicationError(error, 'unhandled-promise-rejection', 'infrastructure');
    
    reportError(applicationError, {
      unhandledRejection: true,
      asyncErrorBoundary: true
    });

    // Prevent default browser behavior
    event.preventDefault();
    
    // Update state to show error UI
    this.setState({
      hasError: true,
      error,
      errorId: `async_rejection_${Date.now()}`
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBoundary
          fallback={this.props.fallback}
          onError={this.props.onError}
          operation={this.props.operation}
          retryable={this.props.retryable}
        >
          <div>Async Error Occurred</div>
        </ErrorBoundary>
      );
    }

    return this.props.children;
  }
} 