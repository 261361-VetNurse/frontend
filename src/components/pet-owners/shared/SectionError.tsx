
import React from 'react';
import { theme } from '@/styles/tokens/theme';
import RefreshIcon from '@mui/icons-material/Refresh';

interface SectionErrorProps {
    message?: string;
    onRetry?: () => void;
    height?: string | number;
}

const SectionError: React.FC<SectionErrorProps> = ({
    message = "Failed to load data",
    onRetry,
    height = "auto"
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: '#FFF5F5',
            borderRadius: '12px',
            color: theme.colors.error,
            textAlign: 'center',
            gap: '8px',
            height: height,
            width: '100%',
            minHeight: '80px',
            boxSizing: 'border-box'
        }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{message}</div>
            {onRetry && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onRetry();
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        marginTop: '4px'
                    }}
                >
                    <RefreshIcon sx={{ fontSize: 14 }} />
                    <span>Tap to retry</span>
                </div>
            )}
        </div>
    );
};

export default SectionError;
