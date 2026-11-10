import React, { useRef, useState } from 'react';
import { uploadApi } from '../../services/api';
import { ImagePlus, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ImageUploadField = ({ imageUrl, onChange, onUploadingChange }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension) || !ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPG, JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size must not exceed 5 MB.');
      return;
    }

    setError('');
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const response = await uploadApi.upload(file);
      onChange(response.data.url);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-main mb-1">Image</label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-60"
        >
          <ImagePlus className="w-4 h-4" />
          {uploading ? 'Uploading...' : imageUrl ? 'Change image' : 'Upload image'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="text-[11px] text-muted">JPG, JPEG, PNG, or WEBP, up to 5 MB</span>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>
      {imageUrl && (
        <ImageWithFallback
          src={imageUrl}
          alt="Selected upload preview"
          className="mt-3 h-32 w-full rounded-xl border border-slate-200 bg-slate-50 object-cover"
        />
      )}
      {uploading && <p className="mt-2 text-xs text-muted">Uploading image...</p>}
      {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default ImageUploadField;
