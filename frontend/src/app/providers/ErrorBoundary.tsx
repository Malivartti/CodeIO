import ErrorPage from '@pages/ErrorPage/ErrorPage';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <ErrorPage
          title="Ошибка веб-приложения"
          error={this.state.error?.message || 'Произошла неожиданная ошибка'}
          onRetry={this.handleRetry}
          showRetry={true}
        >
          {isDevelopment && this.state.error && (
            <details className="w-full mt-4">
              <summary className="cursor-pointer text-secondary text-sm mb-2">
                Техническая информация (только в режиме разработки)
              </summary>
              <div className="bg-tertiary rounded p-3 text-xs font-mono text-secondary max-h-32 overflow-auto">
                <div className="mb-2">
                  <strong>Ошибка:</strong> {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Стек компонентов:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </ErrorPage>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
