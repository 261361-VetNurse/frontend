import { Link } from 'react-router-dom';

export default function NotFoundPage() {
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
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🐾</div>
            <h1
                style={{
                    fontSize: '64px',
                    fontWeight: 700,
                    color: '#4663AC',
                    margin: 0,
                    lineHeight: 1,
                }}
            >
                404
            </h1>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    marginTop: '16px',
                    marginBottom: '8px',
                }}
            >
                Page not found
            </h2>
            <p
                style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '32px',
                    maxWidth: '280px',
                }}
            >
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                to="/pet-owners/home-page"
                style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: '#4663AC',
                    borderRadius: '8px',
                    textDecoration: 'none',
                }}
            >
                Go to Home
            </Link>
        </div>
    );
}
