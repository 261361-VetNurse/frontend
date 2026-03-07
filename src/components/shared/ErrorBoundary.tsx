import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global error boundary component.
 * Catches any runtime error thrown during render and displays
 * a recovery UI instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // In development log details to console.
        // In production, pipe to your error reporter (Sentry, Datadog, etc.)
        if (import.meta.env.DEV) {
            console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '24px',
                        textAlign: 'center',
                        fontFamily: 'K2D, system-ui, sans-serif',
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    <div
                        style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                        }}
                    >
                        🐾
                    </div>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            color: '#1a1a2e',
                            marginBottom: '8px',
                        }}
                    >
                        Something went wrong
                    </h2>
                    <p
                        style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            marginBottom: '24px',
                            maxWidth: '320px',
                        }}
                    >
                        An unexpected error occurred. Your data is safe — please try refreshing the page.
                    </p>
                    {import.meta.env.DEV && this.state.error && (
                        <pre
                            style={{
                                fontSize: '11px',
                                color: '#dc3545',
                                backgroundColor: '#fff5f5',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '24px',
                                maxWidth: '400px',
                                overflow: 'auto',
                                textAlign: 'left',
                            }}
                        >
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '10px 24px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#fff',
                            backgroundColor: '#4663AC',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * HOC convenience wrapper — wraps any component in an ErrorBoundary.
 *
 * Usage:
 *   export default withErrorBoundary(MyComponent);
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    function WithBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    }

    WithBoundary.displayName = `withErrorBoundary(${displayName})`;
    return WithBoundary;
}
