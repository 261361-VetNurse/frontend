'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';

export default function TestUploadPage() {
    const [uploadedUrl, setUploadedUrl] = useState<string>('');
    const [folder, setFolder] = useState<'pet-profile' | 'pet-owner-profile' | 'symptom-record'>('pet-profile');

    return (
        <div className="p-8 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Image Upload (R2)</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Folder</label>
                    <select
                        value={folder}
                        onChange={(e) => setFolder(e.target.value as any)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="pet-profile">Pet Profile (pet-profile)</option>
                        <option value="pet-owner-profile">Owner Profile (pet-owner-profile)</option>
                        <option value="symptom-record">Symptom Record (symptom-record)</option>
                    </select>
                </div>

                <h2 className="text-lg font-semibold mb-4">Upload Component</h2>

                <ImageUpload
                    key={folder} // Force re-mount on folder change
                    folder={folder}
                    onUploadComplete={(url) => {
                        console.log('Parent received URL:', url);
                        setUploadedUrl(url);
                    }}
                    className="w-32 h-32"
                />

                {uploadedUrl && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm break-all">
                        <p className="font-semibold text-green-700">Upload Successful!</p>
                        <p className="text-green-600 mt-1">{uploadedUrl}</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Select an image file (JPG, PNG, WEBP)</li>
                    <li>Watch the console for upload progress logs</li>
                    <li>Verify the "Upload Successful" message appears</li>
                    <li>Check if the image preview renders correctly</li>
                </ul>
            </div>
        </div>
    );
}
