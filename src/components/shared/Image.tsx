import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    objectFit?: React.CSSProperties['objectFit'];
    sizes?: string;
};

export default function Image({ fill, priority, objectFit, sizes, style, src, alt, ...props }: ImageProps) {
    const customStyle: React.CSSProperties = { ...style };

    if (objectFit) {
        customStyle.objectFit = objectFit;
    }

    if (fill) {
        customStyle.position = 'absolute';
        customStyle.top = 0;
        customStyle.left = 0;
        customStyle.width = '100%';
        customStyle.height = '100%';
        customStyle.objectFit = 'cover';
    }

    // Handle statically imported Next.js images (which resolve to an object with `src`)
    const imageSrc = typeof src === 'object' && src !== null && 'src' in src ? (src as any).src : src;

    return <img src={imageSrc} style={customStyle} alt={alt || ''} loading={priority ? 'eager' : 'lazy'} decoding="async" {...props} />;
}
