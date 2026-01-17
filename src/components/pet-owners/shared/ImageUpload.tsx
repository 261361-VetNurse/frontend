"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Box, Button, Typography, CircularProgress, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "@/styles/theme";

interface ImageUploadProps {
    /**
     * Current image URL (optional, for displaying existing image)
     */
    currentImageUrl?: string;
    /**
     * Callback when image is successfully uploaded
     * Returns the public URL of the uploaded image
     */
    onImageUploaded: (url: string) => void;
    /**
     * Callback when upload fails
     */
    onError?: (error: string) => void;
    /**
     * Maximum file size in MB (default: 10MB)
     */
    maxSizeMB?: number;
    /**
     * Width of the upload area (default: "100%")
     */
    width?: string | number;
    /**
     * Height of the upload area (default: 200)
     */
    height?: string | number;
}

export default function ImageUpload({
    currentImageUrl,
    onImageUploaded,
    onError,
    maxSizeMB = 10,
    width = "100%",
    height = 200,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return "Invalid file type. Please upload JPEG, PNG, or WEBP image.";
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File too large. Maximum size is ${maxSizeMB}MB.`;
        }

        return null;
    };

    const handleFileUpload = async (file: File) => {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            onError?.(validationError);
            return;
        }

        setUploading(true);

        try {
            // Create preview and use it as the "uploaded" URL (mock)
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreview(dataUrl);

                // Simulate successful upload with data URL
                console.log('[MOCK] Image uploaded:', file.name, file.size, 'bytes');
                onImageUploaded(dataUrl);
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
            onError?.(errorMessage);
            setPreview(currentImageUrl || null);
            setUploading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box sx={{ width }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <Box
                onClick={!preview && !uploading ? handleClick : undefined}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                sx={{
                    width: "100%",
                    height,
                    border: `2px dashed ${dragActive ? theme.colors.primary : theme.colors.textPrimary}`,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: preview || uploading ? "default" : "pointer",
                    backgroundColor: dragActive ? `${theme.colors.primary}10` : theme.colors.background,
                    backgroundImage: preview ? `url(${preview})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        borderColor: !preview && !uploading ? theme.colors.primary : undefined,
                    },
                }}
            >
                {uploading && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                        }}
                    >
                        <CircularProgress size={40} />
                        <Typography sx={{ mt: 2, color: theme.colors.textSecondary }}>
                            Uploading...
                        </Typography>
                    </Box>
                )}

                {!preview && !uploading && (
                    <Box sx={{ textAlign: "center", p: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: theme.colors.textSecondary, mb: 1 }} />
                        <Typography variant="body1" sx={{ mb: 0.5 }}>
                            Click to upload or drag and drop
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.colors.textSecondary }}>
                            JPEG, PNG, WEBP (max {maxSizeMB}MB)
                        </Typography>
                    </Box>
                )}

                {preview && !uploading && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                        }}
                    >
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                            }}
                            sx={{
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                color: "white",
                                "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                },
                            }}
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {preview && !uploading && (
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    sx={{ mt: 2, width: "100%" }}
                >
                    Change Image
                </Button>
            )}
        </Box>
    );
}
