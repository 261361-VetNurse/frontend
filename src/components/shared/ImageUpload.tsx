import React, { useState, useRef } from 'react';
import { uploadImage } from '@/services/api/client';
import { authStorage } from '@/services/api/client';
import { Loader2 } from 'lucide-react';
import Image from '@/components/shared/Image';
const EditIcon = ({ style }: { style?: React.CSSProperties }) => (
    <Image src="/edit.svg" alt="edit" style={{ width: 32, height: 32, ...style, filter: 'brightness(0) invert(1)' }} />
);


interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: 'pet-owner-profile' | 'pet-profile' | 'symptom-record';
    currentImage?: string;
    className?: string;
}

const DEFAULT_IMAGES = {
    'pet-owner-profile': 'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/biank_pet_owner_profile_1x.webp',
    'pet-profile': 'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/blank_pet_profile_1x.webp',
    'symptom-record': 'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/default_image.webp',
    'default': 'https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/default_image.webp',
};

export function ImageUpload({
    onUploadComplete,
    folder,
    currentImage,
    className
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);

    // Determine display image: preview (newly uploaded) -> currentImage (prop) -> default
    const displayImage = preview || currentImage || DEFAULT_IMAGES[folder || 'default'];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setUploading(true);

        try {
            // 1. Validation
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Invalid file type. Please upload JPEG, PNG, or WEBP.');
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB
                throw new Error('File too large. Maximum size is 10MB.');
            }

            // 2. Upload to R2 via backend
            const token = authStorage.getToken();
            if (!token) throw new Error('Authentication required');

            // Map internal folder to storage folder
            const storageFolder = folder === 'pet-owner-profile' ? 'users' :
                folder === 'symptom-record' ? 'records' : 'pets';

            const publicUrl = await uploadImage(file, token, storageFolder);

            // 3. Success - use the returned URL directly
            setPreview(publicUrl);
            onUploadComplete(publicUrl);

        } catch (err) {
            console.error('Upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={`relative ${className}`} style={{ overflow: 'visible' }}>
            <div className="relative w-full h-full rounded-full overflow-hidden group border-2">
                <Image
                    alt="Profile"
                    src={displayImage}
                    fill
                    className="object-cover transition-opacity duration-300"
                    unoptimized
                />

                {/* Overlay for dimming and centering button */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full rounded-full flex items-center justify-center shadow-sm hover:bg-white/40 transition-colors z-10"
                        disabled={uploading}
                    >
                        <EditIcon style={{ fontSize: '32px', color: 'white' }} />
                    </button>
                </div>

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
            />

            {error && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max max-w-[200px] text-xs text-red-500 bg-white px-2 py-1 rounded shadow text-center z-30">
                    {error}
                </div>
            )}
        </div>
    );
}
