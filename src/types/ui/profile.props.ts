// UI Component Props - Profile

export type ProfileSize = number | string;

export interface ProfileProps {
    imageUrl: string;
    size?: ProfileSize;
    alt?: string;
    className?: string;
    onClick?: () => void;
}
