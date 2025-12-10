import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Uncaught error:', error, errorInfo);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div>
                  <h1 className="text-3xl font-display font-bold text-white">
                    Erro Fatal
                  </h1>
                  <p className="text-red-300 font-mono text-sm">
                    A aplicação encontrou um erro inesperado
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="mb-6 p-4 bg-black/50 rounded-lg border border-red-500/20">
                  <p className="text-red-400 font-mono text-sm mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-gray-400 hover:text-white">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-[10px] text-gray-500 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-lg"
                >
                  Recarregar Aplicação
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all"
                >
                  Voltar
                </button>
              </div>

              <p className="mt-6 text-xs text-gray-500 text-center">
                Se o problema persistir, contate o suporte técnico
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
