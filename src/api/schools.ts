import apiClient from '../lib/axios';

export interface SchoolItem {
  id: string;
  name: string;
  shortCode: string;
  slug: string;
  region: string | null;
  motto: string | null;
  crestUrl: string | null;
  turfScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolStats {
  totalWithCrest: number;
  totalMissingCrest: number;
  totalSchools: number;
}

export interface SchoolsResponse {
  schools: SchoolItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: SchoolStats;
}

export interface SchoolsQueryParams {
  search?: string;
  region?: string;
  filter?: 'all' | 'with-crest' | 'missing-crest';
  page?: number;
  limit?: number;
}

export interface UploadCrestResponse {
  uploadUrl: string;
  cdnUrl: string;
  provider?: 'cloudinary' | 's3';
  uploadParams?: Record<string, any>;
}

export interface UpdateSchoolPayload {
  name?: string;
  shortCode?: string;
  region?: string | null;
  motto?: string | null;
  crestUrl?: string | null;
  turfScore?: number;
}

export const schoolsApi = {
  /**
   * Fetch paginated schools with optional search, region, and coverage filter
   */
  async getSchools(params?: SchoolsQueryParams): Promise<SchoolsResponse> {
    const response = await apiClient.get<SchoolsResponse>('/admin/schools', {
      params,
    });
    return response.data;
  },

  /**
   * Fetch single school by ID
   */
  async getSchool(id: string): Promise<SchoolItem> {
    const response = await apiClient.get<SchoolItem>(`/admin/schools/${id}`);
    return response.data;
  },

  /**
   * Request signed upload URL and target CDN URL from backend (Cloudinary or S3/R2)
   */
  async getUploadCrestPresignedUrl(
    id: string,
    contentType: string = 'image/webp'
  ): Promise<UploadCrestResponse> {
    const response = await apiClient.post<UploadCrestResponse>(
      `/admin/schools/${id}/upload-crest`,
      { contentType }
    );
    return response.data;
  },

  /**
   * Directly upload raw binary file to Cloudinary from the client
   */
  async uploadBinaryToStorage(
    uploadInfo: UploadCrestResponse,
    file: File
  ): Promise<string> {
    const { uploadUrl, cdnUrl, uploadParams } = uploadInfo;

    const formData = new FormData();
    formData.append('file', file);
    if (uploadParams) {
      Object.entries(uploadParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          formData.append(k, String(v));
        }
      });
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(
        errJson.error?.message ||
          `Cloudinary upload rejected with HTTP ${response.status}. Check API credentials and settings.`
      );
    }

    const result = await response.json();
    return result.secure_url || result.url || cdnUrl;
  },

  /**
   * Persist updated school details (motto, crestUrl, etc.) in PostgreSQL database
   */
  async updateSchool(id: string, payload: UpdateSchoolPayload): Promise<SchoolItem> {
    const response = await apiClient.patch<SchoolItem>(`/admin/schools/${id}`, payload);
    return response.data;
  },

  /**
   * Delete school record
   */
  async deleteSchool(id: string): Promise<void> {
    await apiClient.delete(`/admin/schools/${id}`);
  },
};

export default schoolsApi;
