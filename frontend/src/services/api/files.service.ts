import { apiClient } from './config';
import type { FileMetadataResponseDto } from './types';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const filesService = {
  uploadFile: async (file: File): Promise<FileMetadataResponseDto> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: Date.now(),
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        ownerId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<FileMetadataResponseDto>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (id: number, filename?: string): Promise<void> => {
    let blob: Blob;
    
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#10b981';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Файл', 200, 200);
      }
      blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          resolve(b || new Blob());
        }, 'image/png');
      });
    } else {
      const response = await apiClient.get(`/files/${id}/download`, {
        responseType: 'blob',
      });
      blob = response.data;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  getFileUrl: async (id: number): Promise<string | null> => {
    if (USE_MOCK_DATA) {
      return null;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/resource';
      const token = localStorage.getItem('accessToken');
      return `${baseURL}/files/${id}/download${token ? `?token=${token}` : ''}`;
    } catch (error) {
      console.error('Failed to get file URL:', error);
      return null;
    }
  },

  getFileBlob: async (id: number): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#10b981';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Файл', 200, 200);
      }
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          resolve(b || new Blob());
        }, 'image/png');
      });
    }

    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

