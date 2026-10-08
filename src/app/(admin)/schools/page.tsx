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

/**
 * Deterministic, vibrant neo-brutalist badge background color for schools without crests.
 */
function getSchoolBadgeColor(shortCode: string): string {
  const colors = [
    '#055B38', // Deep Forest Green (Prempeh)
    '#172554', // Navy Blue (Achimota)
    '#7C2D12', // Crimson / Brick
    '#0F766E', // Deep Teal
    '#4338CA', // Indigo
    '#B45309', // Warm Amber
    '#0369A1', // Deep Sky
    '#9D174D', // Deep Rose
  ];
  if (!shortCode) return colors[0];
  let hash = 0;
  for (let i = 0; i < shortCode.length; i++) {
    hash = shortCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

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
    <div className="flex flex-col h-full w-full bg-[#F5F3EC] text-[#111827] overflow-y-auto">
      {/* ── Top Header Section (Warm Cream Canvas) ── */}
      <div className="border-b-2 border-black bg-[#F5F3EC] px-6 sm:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F4D06F] text-[#111827] border-2 border-black shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] flex flex-wrap items-center gap-2.5">
                  School Directory Administration
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#F4D06F] text-[#111827] border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                    {stats.totalSchools} Total
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#4B5563] mt-1">
                  Bulk directory ingestion, local filesystem crest binary upload, and CDN asset management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchSchools()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8F5EF] text-[#111827] border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Metric / Summary Cards (Structured Neo-Brutalist White Cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-6">
          {/* Card 1: Total Directory Size */}
          <div
            onClick={() => {
              setCrestFilter('all');
              setPage(1);
            }}
            className={`p-5 rounded-2xl border-2 border-black transition-all cursor-pointer select-none ${
              crestFilter === 'all'
                ? 'bg-white shadow-[4px_4px_0px_#000] -translate-y-0.5 ring-2 ring-[#F4D06F]'
                : 'bg-white shadow-[3px_3px_0px_#000] hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#4B5563]">
                Total Directory Size
              </span>
              {crestFilter === 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-[#F4D06F] border-[1.5px] border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_#000]">
                  Active
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-[#111827] mt-2 tracking-tight">
              {stats.totalSchools.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-[#4B5563] mt-1">
              All ingested secondary institutions
            </div>
          </div>

          {/* Card 2: Crests Uploaded */}
          <div
            onClick={() => {
              setCrestFilter('with-crest');
              setPage(1);
            }}
            className={`p-5 rounded-2xl border-2 border-black transition-all cursor-pointer select-none ${
              crestFilter === 'with-crest'
                ? 'bg-white shadow-[4px_4px_0px_#000] -translate-y-0.5 ring-2 ring-emerald-500'
                : 'bg-white shadow-[3px_3px_0px_#000] hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#4B5563]">
                Crests Uploaded
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border-[1.5px] border-black text-[11px] font-black inline-flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 stroke-[3]" />
                <span>
                  {stats.totalSchools > 0
                    ? `${Math.round((stats.totalWithCrest / stats.totalSchools) * 100)}% coverage`
                    : '0% coverage'}
                </span>
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-2 tracking-tight">
              {stats.totalWithCrest.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-[#4B5563] mt-1">
              Active crest assets deployed to CDN
            </div>
          </div>

          {/* Card 3: Pending Crest Binary */}
          <div
            onClick={() => {
              setCrestFilter('missing-crest');
              setPage(1);
            }}
            className={`p-5 rounded-2xl border-2 border-black transition-all cursor-pointer select-none ${
              crestFilter === 'missing-crest'
                ? 'bg-white shadow-[4px_4px_0px_#000] -translate-y-0.5 ring-2 ring-[#F4D06F]'
                : 'bg-white shadow-[3px_3px_0px_#000] hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#4B5563]">
                Pending Crest Binary
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4D06F] text-[#111827] border-[1.5px] border-black text-[11px] font-black inline-flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000]">
                <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Action Required</span>
              </span>
            </div>
            <div className="text-3xl font-black text-[#111827] mt-2 tracking-tight">
              {stats.totalMissingCrest.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-[#4B5563] mt-1">
              Schools requiring crest image file
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
        {/* Search & Filter Bar */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563] stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search by school name, short code (e.g. PRESEC), slug, or region..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 pl-10 pr-4 bg-white border-2 border-black rounded-xl text-xs sm:text-sm font-semibold text-[#111827] placeholder:text-[#6B7280] shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#F4D06F] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4B5563]">
              <Filter className="h-4 w-4 stroke-[2.5] text-[#111827]" />
              <span>Region:</span>
            </div>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setPage(1);
                }}
                className="h-11 appearance-none bg-white border-2 border-black rounded-xl text-xs font-black text-[#111827] pl-4 pr-9 shadow-[2px_2px_0px_#000] outline-none cursor-pointer focus:ring-2 focus:ring-[#F4D06F] active:translate-y-0.5 transition-all"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="font-semibold text-black">
                    {r}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black font-black text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* ── Schools Data Table (White Neo-Brutalist Card Container) ── */}
        <div className="border-[2.5px] border-black rounded-2xl bg-white shadow-[4px_4px_0px_#000] overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F5EF] border-b-2 border-black text-[#111827] uppercase tracking-wider text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4 w-20 text-center">CREST</th>
                  <th className="py-3.5 px-4">SCHOOL DETAILS</th>
                  <th className="py-3.5 px-4 w-32">SHORT CODE</th>
                  <th className="py-3.5 px-4 w-36">REGION</th>
                  <th className="py-3.5 px-4 max-w-xs">SCHOOL MOTTO</th>
                  <th className="py-3.5 px-4 w-28 text-right">TURF SCORE</th>
                  <th className="py-3.5 px-4 w-36 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y border-black font-normal">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#111827] stroke-[2.5]" />
                        <span className="text-xs font-black uppercase tracking-wider text-[#4B5563]">
                          Loading school registry records...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="h-8 w-8 text-[#4B5563] stroke-[2.5]" />
                        <span className="font-black text-[#111827] text-sm">No schools match your search query</span>
                        <span className="text-xs text-[#4B5563] font-medium">Try adjusting your filters or search keywords</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const hasCrest = !!school.crestUrl;
                    return (
                      <tr
                        key={school.id}
                        className="even:bg-[#FAF8F2] odd:bg-white hover:bg-[#F4D06F]/15 transition-colors group border-b border-black/15 last:border-b-0"
                      >
                        {/* Crest Column */}
                        <td className="py-3.5 px-4 text-center">
                          {hasCrest ? (
                            <div className="w-11 h-11 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] overflow-hidden flex items-center justify-center p-1 mx-auto shrink-0">
                              <img
                                src={school.crestUrl!}
                                alt={`${school.name} crest`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-11 h-11 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black text-xs text-white uppercase select-none mx-auto shrink-0"
                              style={{ backgroundColor: getSchoolBadgeColor(school.shortCode || school.name) }}
                              title={`${school.name} (${school.shortCode.slice(0, 3)})`}
                            >
                              <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
                                {(school.shortCode || 'SCH').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* School Details */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-[#111827] text-sm leading-snug group-hover:text-black transition-colors">
                            {school.name}
                          </div>
                          <div className="text-[11px] text-[#4B5563] font-mono font-bold mt-0.5">
                            {school.slug}
                          </div>
                        </td>

                        {/* Short Code */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-white border-2 border-black text-[#111827] font-mono font-black text-xs shadow-[1.5px_1.5px_0px_#000] inline-block">
                            {school.shortCode}
                          </span>
                        </td>

                        {/* Region */}
                        <td className="py-3.5 px-4">
                          {school.region ? (
                            <span className="inline-block px-2.5 py-1 rounded-full bg-[#F5F3EC] border-[1.5px] border-black text-[#111827] text-xs font-bold shadow-[1px_1px_0px_#000]">
                              {school.region}
                            </span>
                          ) : (
                            <span className="text-[#6B7280] italic text-xs font-medium">Unassigned</span>
                          )}
                        </td>

                        {/* Motto */}
                        <td className="py-3.5 px-4 max-w-xs truncate" title={school.motto || ''}>
                          {school.motto ? (
                            <span className="italic font-bold text-[#111827] font-serif text-xs">
                              "{school.motto}"
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF] italic text-xs">No motto configured</span>
                          )}
                        </td>

                        {/* Turf Score */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-[#111827] text-sm">
                          {school.turfScore}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => openUploadModal(school)}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer ${
                              hasCrest
                                ? 'bg-white hover:bg-[#F8F5EF] text-[#111827]'
                                : 'bg-[#F4D06F] hover:bg-[#F6D86B] text-[#111827]'
                            }`}
                          >
                            <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>{hasCrest ? 'Update Crest' : 'Upload Crest'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-[#F8F5EF] border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#111827]">
            <div>
              Showing <span className="font-black text-black">{schools.length}</span> of{' '}
              <span className="font-black text-black">{totalCount}</span> schools (Page {page} of{' '}
              {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F5EF] border-2 border-black text-[#111827] font-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F5EF] border-2 border-black text-[#111827] font-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Crest Binary Upload & Motto Administration Modal (Neo-Brutalist) ── */}
      {activeSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white border-[3px] border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b-2 border-black bg-[#F8F5EF]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4D06F] text-[#111827] border-2 border-black shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center">
                  <Upload className="h-4.5 w-4.5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">Upload School Crest</h3>
                  <p className="text-xs font-bold text-[#4B5563]">{activeSchool.name}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#F4D06F] text-[#111827] border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
                title="Close modal"
              >
                <X className="h-4 w-4 stroke-[3]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] bg-white">
              {/* School Meta Snapshot */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F3EC] border-2 border-black text-xs shadow-[2px_2px_0px_#000]">
                <div>
                  <span className="text-[#4B5563] block text-[11px] font-black uppercase tracking-wider">Short Code</span>
                  <span className="font-mono font-black text-sm text-[#111827]">{activeSchool.shortCode}</span>
                </div>
                <div>
                  <span className="text-[#4B5563] block text-[11px] font-black uppercase tracking-wider">Slug Identifier</span>
                  <span className="font-mono font-bold text-xs text-[#111827]">{activeSchool.slug}</span>
                </div>
                <div>
                  <span className="text-[#4B5563] block text-[11px] font-black uppercase tracking-wider">Region</span>
                  <span className="font-bold text-xs text-[#111827]">{activeSchool.region || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[#4B5563] block text-[11px] font-black uppercase tracking-wider">Destination Asset Key</span>
                  <span className="font-mono text-[11px] font-bold text-[#4B5563]">
                    crests/{activeSchool.slug}.webp
                  </span>
                </div>
              </div>

              {/* Local File System Drag & Drop Area */}
              <div>
                <label className="block text-xs font-black text-[#111827] mb-2 uppercase tracking-wide">
                  Crest Binary File <span className="text-rose-600">*</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-black rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'bg-[#F4D06F]/20 scale-[1.01]'
                      : previewUrl
                      ? 'bg-[#F8F5EF]'
                      : 'bg-[#FAF8F2] hover:bg-white'
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
                      <div className="w-28 h-28 rounded-2xl border-2 border-black bg-white p-2 flex items-center justify-center shadow-[3px_3px_0px_#000]">
                        <img
                          src={previewUrl}
                          alt="Crest preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-[#111827]">
                          {selectedFile ? selectedFile.name : 'Current Registered Crest'}
                        </p>
                        {selectedFile && (
                          <p className="text-[11px] font-bold text-[#4B5563]">
                            {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type}
                          </p>
                        )}
                        <span className="mt-1.5 inline-block text-[11px] font-black text-[#111827] underline decoration-2 decoration-[#F4D06F] hover:text-black">
                          Click or drag another image to replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-[#111827]">
                        <FileImage className="h-6 w-6 stroke-[2]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#111827]">
                          Drag and drop crest image here, or{' '}
                          <span className="underline decoration-2 decoration-[#F4D06F]">browse files</span>
                        </p>
                        <p className="text-[11px] font-bold text-[#4B5563] mt-1">
                          Direct local binary upload only. Supported: WebP, PNG, JPEG, SVG (Max 5MB).
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strict Enforcement Notice */}
                <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-[#4B5563]">
                  <ShieldAlert className="h-4 w-4 text-[#111827] stroke-[2.5]" />
                  <span>
                    Direct local file upload enforced. Pasting external image URLs is disabled.
                  </span>
                </div>
              </div>

              {/* School Motto Field */}
              <div>
                <label className="block text-xs font-black text-[#111827] mb-1.5 uppercase tracking-wide">
                  School Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g. In Lumine Tuo Videbimus Lumen"
                  value={editedMotto}
                  onChange={(e) => setEditedMotto(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border-2 border-black rounded-xl text-xs sm:text-sm font-semibold text-[#111827] placeholder:text-[#9CA3AF] shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#F4D06F] font-serif transition-all"
                />
                <p className="text-[11px] font-bold text-[#4B5563] mt-1">
                  Persisted to PostgreSQL alongside crest storage CDN URL.
                </p>
              </div>

              {/* Status & Feedback message */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                    statusMessage.isError
                      ? 'bg-rose-100 text-rose-950'
                      : 'bg-emerald-100 text-emerald-950'
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-700 stroke-[3]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 stroke-[3]" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Upload Progress Tracker */}
              {isUploading && (
                <div className="p-3.5 rounded-xl bg-[#F4D06F]/30 border-2 border-black flex items-center gap-3 shadow-[2px_2px_0px_#000]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#111827] stroke-[3]" />
                  <span className="text-xs text-[#111827] font-black">{uploadProgress}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4.5 border-t-2 border-black bg-[#F8F5EF]">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F8F5EF] text-[#111827] border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndUpload}
                disabled={isUploading || (!selectedFile && editedMotto === (activeSchool.motto || ''))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F4D06F] hover:bg-[#F6D86B] text-[#111827] border-2 border-black font-black text-xs shadow-[3px_3px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-[2px_2px_0px_#000]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                    <span>Processing Upload...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 stroke-[2.5]" />
                    <span>Save & Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
