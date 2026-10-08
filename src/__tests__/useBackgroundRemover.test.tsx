import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { renderHook, act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useBackgroundRemover } from '../hooks/useBackgroundRemover';
import { CrestBackgroundCleanerModal } from '../components/schools/CrestBackgroundCleanerModal';

// Mock @imgly/background-removal
vi.mock('@imgly/background-removal', () => {
  return {
    removeBackground: vi.fn(),
  };
});

import { removeBackground } from '@imgly/background-removal';

describe('useBackgroundRemover hook', () => {
  const mockRemoveBackground = vi.mocked(removeBackground);

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn((blob) => `blob:mock-url-${blob?.size || '0'}`);
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default idle state', () => {
    const { result } = renderHook(() => useBackgroundRemover());

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.cleanBlob).toBeNull();
    expect(result.current.cleanUrl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('processes image and returns transparent PNG blob on success', async () => {
    const fakeBlob = new Blob(['png-bytes'], { type: 'image/png' });
    mockRemoveBackground.mockImplementation(async (file, config) => {
      config?.progress?.('fetch:model', 50, 100);
      config?.progress?.('compute:inference', 100, 100);
      return fakeBlob;
    });

    const testFile = new File(['image-data'], 'school_crest.jpg', { type: 'image/jpeg' });
    const { result } = renderHook(() => useBackgroundRemover(testFile));

    let outputBlob: Blob | null = null;
    await act(async () => {
      outputBlob = await result.current.processImage();
    });

    expect(mockRemoveBackground).toHaveBeenCalledTimes(1);
    expect(outputBlob).toBe(fakeBlob);
    expect(result.current.cleanBlob).toBe(fakeBlob);
    expect(result.current.progress).toBe(100);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cleanUrl).toContain('blob:mock-url');

    const cleanFile = result.current.getCleanFile();
    expect(cleanFile).not.toBeNull();
    expect(cleanFile?.name).toBe('school_crest_clean.png');
    expect(cleanFile?.type).toBe('image/png');
  });

  it('handles segmentation failures gracefully without crashing', async () => {
    const failureError = new Error('ONNX inference failed: corrupted image data');
    mockRemoveBackground.mockRejectedValue(failureError);

    const testFile = new File(['bad-data'], 'broken.png', { type: 'image/png' });
    const { result } = renderHook(() => useBackgroundRemover());

    let outputBlob: Blob | null = null;
    await act(async () => {
      outputBlob = await result.current.processImage(testFile);
    });

    expect(outputBlob).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.cleanBlob).toBeNull();
    expect(result.current.error).toBe(failureError);
  });

  it('resets state and revokes URL on reset() call', async () => {
    const fakeBlob = new Blob(['png-bytes'], { type: 'image/png' });
    mockRemoveBackground.mockResolvedValue(fakeBlob);

    const testFile = new File(['test'], 'crest.png', { type: 'image/png' });
    const { result } = renderHook(() => useBackgroundRemover(testFile));

    await act(async () => {
      await result.current.processImage();
    });

    expect(result.current.cleanBlob).toBe(fakeBlob);

    act(() => {
      result.current.reset();
    });

    expect(result.current.cleanBlob).toBeNull();
    expect(result.current.cleanUrl).toBeNull();
    expect(result.current.progress).toBe(0);
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});

describe('CrestBackgroundCleanerModal component', () => {
  const mockRemoveBackground = vi.mocked(removeBackground);
  const testFile = new File(['crest-content'], 'prempeh.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders side-by-side preview and triggers WASM processing upon opening', async () => {
    const fakeBlob = new Blob(['clean-crest'], { type: 'image/png' });
    mockRemoveBackground.mockResolvedValue(fakeBlob);

    const handleUpload = vi.fn();
    const handleClose = vi.fn();

    render(
      <CrestBackgroundCleanerModal
        file={testFile}
        isOpen={true}
        onClose={handleClose}
        onUpload={handleUpload}
        schoolName="Prempeh College"
      />
    );

    expect(screen.getByText('AI Crest Background Remover')).toBeInTheDocument();
    expect(screen.getByText('Processing crest for Prempeh College')).toBeInTheDocument();
    expect(screen.getByText('Original Image')).toBeInTheDocument();
    expect(screen.getByText('Isolated Crest (WASM)')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRemoveBackground).toHaveBeenCalled();
    });
  });

  it('calls onUpload with clean PNG file when "Confirm & Upload Cleaned Crest" is clicked', async () => {
    const fakeBlob = new Blob(['clean-crest'], { type: 'image/png' });
    mockRemoveBackground.mockResolvedValue(fakeBlob);

    const handleUpload = vi.fn();
    const handleClose = vi.fn();

    render(
      <CrestBackgroundCleanerModal
        file={testFile}
        isOpen={true}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    );

    const confirmBtn = await screen.findByRole('button', {
      name: /Confirm & Upload Cleaned Crest/i,
    });

    await waitFor(() => {
      expect(confirmBtn).not.toBeDisabled();
    });

    act(() => {
      fireEvent.click(confirmBtn);
    });

    expect(handleUpload).toHaveBeenCalledTimes(1);
    const uploadedFile: File = handleUpload.mock.calls[0][0];
    expect(uploadedFile.name).toBe('prempeh_clean.png');
    expect(uploadedFile.type).toBe('image/png');
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onUpload with the original raw file when "Use Original" is clicked', async () => {
    const fakeBlob = new Blob(['clean-crest'], { type: 'image/png' });
    mockRemoveBackground.mockResolvedValue(fakeBlob);

    const handleUpload = vi.fn();
    const handleClose = vi.fn();

    render(
      <CrestBackgroundCleanerModal
        file={testFile}
        isOpen={true}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    );

    const useOriginalBtn = screen.getByRole('button', { name: /Use Original/i });
    act(() => {
      fireEvent.click(useOriginalBtn);
    });

    expect(handleUpload).toHaveBeenCalledWith(testFile);
    expect(handleClose).toHaveBeenCalled();
  });

  it('displays graceful error card and allows uploading original file when WASM fails', async () => {
    mockRemoveBackground.mockRejectedValue(new Error('Neural inference failure'));

    const handleUpload = vi.fn();
    const handleClose = vi.fn();

    render(
      <CrestBackgroundCleanerModal
        file={testFile}
        isOpen={true}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    );

    await screen.findByText('Client-Side Segmentation Could Not Complete');
    expect(screen.getByText('Neural inference failure')).toBeInTheDocument();

    const fallbackBtn = screen.getByRole('button', { name: /Upload Original File As-Is/i });
    act(() => {
      fireEvent.click(fallbackBtn);
    });

    expect(handleUpload).toHaveBeenCalledWith(testFile);
    expect(handleClose).toHaveBeenCalled();
  });

  it('maintains consistent hook calls when transitioning from isOpen=false to isOpen=true', async () => {
    const handleUpload = vi.fn();
    const handleClose = vi.fn();

    const { rerender } = render(
      <CrestBackgroundCleanerModal
        file={null}
        isOpen={false}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    );

    expect(screen.queryByText('AI Crest Background Remover')).toBeNull();

    // Rerender with isOpen=true and valid file
    rerender(
      <CrestBackgroundCleanerModal
        file={testFile}
        isOpen={true}
        onClose={handleClose}
        onUpload={handleUpload}
      />
    );

    expect(screen.getByText('AI Crest Background Remover')).toBeInTheDocument();
  });
});
