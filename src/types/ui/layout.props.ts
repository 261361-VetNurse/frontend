// UI Component Props - Layout Components

export interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: boolean;
}
