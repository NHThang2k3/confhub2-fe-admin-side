import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from "@/hooks/use-toast";
import { FaFileUpload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ConferenceEvaluateUploader: React.FC = () => {
    const t = useTranslations('ConferenceEvaluateUploader');
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
            toast({
                title: t('error.invalidFileType'),
                description: t('error.pleaseSelectCsv'),
                variant: "destructive"
            });
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/import-evaluate`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast({
                title: t('success.title'),
                description: t('success.fileImported'),
                variant: "default"
            });

            // Reset form
            setFile(null);
            if (event.target) {
                event.target.value = '';
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || t('error.uploadFailed');
            toast({
                title: t('error.title'),
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
            <p className="text-gray-600 mb-6">{t('description')}</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('fileLabel')}
                    </label>
                    <div className="flex items-center space-x-4">
                        <label
                            className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 ${
                                isUploading ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            <FaFileUpload className={`mr-2 ${isUploading ? 'animate-spin' : ''}`} />
                            <span>
                                {isUploading ? t('uploading') : file ? t('changeFile') : t('chooseFile')}
                            </span>
                            <input
                                type="file"
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                accept=".csv, text/csv"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                        {file && !isUploading && (
                            <span className="min-w-0 flex-shrink truncate text-sm text-gray-600" title={file.name}>
                                {file.name}
                            </span>
                        )}
                        {isUploading && <FaSpinner className="animate-spin text-blue-500" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConferenceEvaluateUploader; 