import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ImageUpload({ onImageUploaded, currentImage, onImageRemoved }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || null);
    const [error, setError] = useState('');

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation côté client
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Format non autorisé. Utilisez JPG, PNG ou WebP.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Fichier trop volumineux. Maximum 5MB.');
            return;
        }

        setError('');
        setUploading(true);

        try {
            // Créer FormData
            const formData = new FormData();
            formData.append('image', file);

            // Upload
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/upload/event-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            const imageUrl = response.data.imageUrl;
            setPreview(`${API_URL}${imageUrl}`);
            onImageUploaded(imageUrl);

        } catch (err) {
            console.error('❌ Erreur upload:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setError('');
        if (onImageRemoved) {
            onImageRemoved();
        }
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: 'var(--gray-700)'
            }}>
                📸 Image de couverture (facultatif)
            </label>

            {preview ? (
                <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '2px solid var(--gray-200)'
                }}>
                    <img
                        src={preview}
                        alt="Aperçu"
                        style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                    >
                        ✕ Supprimer
                    </button>
                </div>
            ) : (
                <div>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        style={{ display: 'none' }}
                        id="image-upload-input"
                    />
                    <label
                        htmlFor="image-upload-input"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            border: '2px dashed var(--gray-300)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            background: uploading ? 'var(--gray-50)' : 'var(--gray-100)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!uploading) e.target.style.borderColor = 'var(--primary-500)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'var(--gray-300)';
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {uploading ? '⏳' : '📷'}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: '600', color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
                                {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter une image'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                                JPG, PNG ou WebP • Max 5MB
                            </p>
                        </div>
                    </label>
                </div>
            )}

            {error && (
                <p style={{
                    marginTop: '0.5rem',
                    color: 'var(--danger-500)',
                    fontSize: '0.875rem'
                }}>
                    ⚠️ {error}
                </p>
            )}
        </div>
    );
}

ImageUpload.propTypes = {
    onImageUploaded: PropTypes.func.isRequired,
    currentImage: PropTypes.string,
    onImageRemoved: PropTypes.func
};

export default ImageUpload;
