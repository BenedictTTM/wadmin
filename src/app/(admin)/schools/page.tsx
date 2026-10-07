'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileImage,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { schoolsApi, SchoolItem, SchoolStats } from '../../../api/schools';

const REGIONS = [
  'All Regions',
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
];

export default function SchoolsAdminPage(): React.JSX.Element {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [stats, setStats] = useState<SchoolStats>({
    totalWithCrest: 0,
    totalMissingCrest: 0,
    totalSchools: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [crestFilter, setCrestFilter] = useState<'all' | 'with-crest' | 'missing-crest'>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal State
  const [activeSchool, setActiveSchool] = useState<SchoolItem | null>(null);
  const [editedMotto, setEditedMotto] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSchools = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await schoolsApi.getSchools({
        search: search.trim() || undefined,
        region: selectedRegion !== 'All Regions' ? selectedRegion : undefined,
        filter: crestFilter,
        page,
        limit: 20,
      });

      setSchools(data.schools || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedRegion, crestFilter, page]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSchools();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [fetchSchools]);

  const openUploadModal = (school: SchoolItem) => {
    setActiveSchool(school);
    setEditedMotto(school.motto || '');
    setSelectedFile(null);
    setPreviewUrl(school.crestUrl || null);
    setStatusMessage(null);
    setUploadProgress('');
  };

  const closeUploadModal = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setActiveSchool(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatusMessage(null);
    setUploadProgress('');
    setIsUploading(false);
  };

  const validateAndSetFile = (file: File) => {
    setStatusMessage(null);
    const validMimes = ['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      setStatusMessage({
        text: 'Invalid file format. Please upload a WebP, PNG, JPEG, or SVG image.',
        isError: true,
      });
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        text: 'File exceeds 5MB limit. Please upload a compressed image.',
        isError: true,
      });
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSaveAndUpload = async () => {
    if (!activeSchool) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      let finalCdnUrl = activeSchool.crestUrl;

      // 1. If user selected a new crest binary from local file system:
      if (selectedFile) {
        setUploadProgress('Requesting signed upload token from backend...');
        const uploadInfo = await schoolsApi.getUploadCrestPresignedUrl(
          activeSchool.id,
          selectedFile.type
        );

        const providerLabel = uploadInfo.provider === 'cloudinary' ? 'Cloudinary' : 'Cloud Storage';
        setUploadProgress(`Streaming binary directly to ${providerLabel}...`);
        const uploadedUrl = await schoolsApi.uploadBinaryToStorage(uploadInfo, selectedFile);

        finalCdnUrl = uploadedUrl;
      }

      // 2. Persist updated crestUrl and motto to PostgreSQL
      setUploadProgress('Persisting records to PostgreSQL database...');
      const updatedSchool = await schoolsApi.updateSchool(activeSchool.id, {
        crestUrl: finalCdnUrl,
        motto: editedMotto,
      });

      // Update state locally
      setSchools((prev) =>
        prev.map((s) => (s.id === updatedSchool.id ? { ...s, ...updatedSchool } : s))
      );

      setStatusMessage({
        text: 'School record and crest persisted successfully!',
        isError: false,
      });

      setTimeout(() => {
        closeUploadModal();
        fetchSchools();
      }, 1200);
    } catch (err: any) {
      console.error('Upload flow error:', err);
      setStatusMessage({
        text: err?.response?.data?.message || err.message || 'An error occurred during crest ingestion',
        isError: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  School Directory Administration
                  <span className="text-xs font-normal text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full">
                    {stats.totalSchools} Total
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bulk directory ingestion, local filesystem crest binary upload, and CDN asset management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSchools()}
              className="text-xs border-slate-700 hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stat KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div
            onClick={() => {
              setCrestFilter('all');
              setPage(1);
            }}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              crestFilter === 'all'
                ? 'bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium text-slate-400">Total Directory Size</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalSchools}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">All ingested secondary institutions</div>
          </div>

          <div
            onClick={() => {
              setCrestFilter('with-crest');
              setPage(1);
            }}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              crestFilter === 'with-crest'
                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Crests Uploaded
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.totalWithCrest}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.totalSchools > 0
                ? `${Math.round((stats.totalWithCrest / stats.totalSchools) * 100)}% coverage achieved`
                : '0% coverage'}
            </div>
          </div>

          <div
            onClick={() => {
              setCrestFilter('missing-crest');
              setPage(1);
            }}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              crestFilter === 'missing-crest'
                ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/5'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Pending Crest Binary
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.totalMissingCrest}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Schools requiring crest image file</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 flex-1 flex flex-col gap-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by school name, short code (e.g. PRESEC), slug, or region..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-slate-950 border-slate-800 text-sm focus:border-indigo-500 text-slate-100 placeholder:text-slate-500 h-9"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Region:</span>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/30 overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Crest</th>
                  <th className="py-3 px-4">School Details</th>
                  <th className="py-3 px-4 w-28">Short Code</th>
                  <th className="py-3 px-4 w-36">Region</th>
                  <th className="py-3 px-4 max-w-xs">School Motto</th>
                  <th className="py-3 px-4 w-24 text-right">Turf Score</th>
                  <th className="py-3 px-4 w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        <span>Loading school registry records...</span>
                      </div>
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-6 w-6 text-slate-600" />
                        <span className="font-medium text-slate-400">No schools match your search query</span>
                        <span className="text-xs text-slate-600">Try adjusting your filters or search keywords</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const hasCrest = !!school.crestUrl;
                    return (
                      <tr
                        key={school.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Crest Thumbnail Preview */}
                        <td className="py-3 px-4 text-center">
                          <div className="w-10 h-10 rounded-lg border border-slate-700/60 bg-slate-950 flex items-center justify-center overflow-hidden mx-auto shadow-inner">
                            {school.crestUrl ? (
                              <img
                                src={school.crestUrl}
                                alt={`${school.name} crest`}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="text-[10px] font-bold text-slate-500 uppercase">
                                {school.shortCode.slice(0, 3)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name & Slug */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {school.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {school.slug}
                          </div>
                        </td>

                        {/* Short Code */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono font-medium text-[11px]">
                            {school.shortCode}
                          </span>
                        </td>

                        {/* Region */}
                        <td className="py-3 px-4 text-slate-300">
                          {school.region ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 text-[11px]">
                              {school.region}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Motto */}
                        <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={school.motto || ''}>
                          {school.motto ? (
                            <span className="italic text-slate-300 font-serif">"{school.motto}"</span>
                          ) : (
                            <span className="text-slate-600 italic">No motto configured</span>
                          )}
                        </td>

                        {/* Turf Score */}
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          {school.turfScore}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant={hasCrest ? 'outline' : 'default'}
                            onClick={() => openUploadModal(school)}
                            className={`text-xs h-7 px-2.5 ${
                              hasCrest
                                ? 'border-slate-700 hover:border-indigo-500 text-slate-300'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                            }`}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            {hasCrest ? 'Update Crest' : 'Upload Crest'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{schools.length}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> schools (Page {page} of{' '}
              {totalPages})
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2 border-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Crest Binary Upload & Motto Administration Modal */}
      {activeSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Upload School Crest</h3>
                  <p className="text-[11px] text-slate-400">{activeSchool.name}</p>
                </div>
              </div>

              <button
                onClick={closeUploadModal}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* School Meta Snapshot */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Short Code</span>
                  <span className="font-mono font-medium text-indigo-300">{activeSchool.shortCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Slug Identifier</span>
                  <span className="font-mono text-slate-300">{activeSchool.slug}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Region</span>
                  <span className="text-slate-300">{activeSchool.region || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Destination S3 Key</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    crests/{activeSchool.slug}.webp
                  </span>
                </div>
              </div>

              {/* Local File System Drag & Drop Area */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-2">
                  Crest Binary File <span className="text-rose-400">*</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
                      : previewUrl
                      ? 'border-indigo-500/40 bg-slate-950/60'
                      : 'border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/70'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/webp,image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-xl border border-slate-700 bg-slate-900 p-2 flex items-center justify-center shadow-lg">
                        <img
                          src={previewUrl}
                          alt="Crest preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-200">
                          {selectedFile ? selectedFile.name : 'Current Registered Crest'}
                        </p>
                        {selectedFile && (
                          <p className="text-[11px] text-slate-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type}
                          </p>
                        )}
                        <span className="mt-1.5 inline-block text-[11px] text-indigo-400 hover:underline">
                          Click or drag another image to replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-3 rounded-full bg-slate-800 text-slate-400">
                        <FileImage className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          Drag and drop crest image here, or{' '}
                          <span className="text-indigo-400 hover:underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Direct local binary upload only. Supported: WebP, PNG, JPEG, SVG (Max 5MB).
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strict Enforcement Notice */}
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
                  <span>
                    Direct local file upload enforced. Pasting external image URLs is disabled.
                  </span>
                </div>
              </div>

              {/* School Motto Field */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  School Motto
                </label>
                <Input
                  type="text"
                  placeholder="e.g. In Lumine Tuo Videbimus Lumen"
                  value={editedMotto}
                  onChange={(e) => setEditedMotto(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 font-serif"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Persisted to PostgreSQL alongside crest storage CDN URL.
                </p>
              </div>

              {/* Status & Feedback message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    statusMessage.isError
                      ? 'bg-rose-950/30 text-rose-300 border border-rose-800/40'
                      : 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40'
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Upload Progress Tracker */}
              {isUploading && (
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="text-xs text-indigo-300 font-medium">{uploadProgress}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
              <Button
                variant="outline"
                size="sm"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="text-xs border-slate-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAndUpload}
                disabled={isUploading || (!selectedFile && editedMotto === (activeSchool.motto || ''))}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Processing Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Save & Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
