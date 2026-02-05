import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { AlertCircleIcon, ImageIcon, ImageOff, Loader2, UploadIcon, XIcon } from 'lucide-react';
import { toast } from '@constructive-io/ui/toast';

import { useDashboardCacheScopeKey } from '@/lib/gql/hooks/dashboard/use-dashboard-cache-scope';
import { useFieldUpload, executeFieldUpload, type UploadProgress, type UploadResponse } from '@/lib/gql/hooks/dashboard/use-image-upload';
import { formatFileSize, getImageMetadata, getImageUrl } from '@/lib/utils/file.utils';
import { Button } from '@constructive-io/ui/button';
import { MotionGrid } from '@constructive-io/ui/motion-grid';
import { ImageWithFallback } from '@/components/image-with-fallback';

import { EditorFocusTrap } from './editor-focus-trap';
import type { DraftSubmitResult } from '../editor-registry';

/** Data passed to onSaveComplete for optimistic updates */
export interface ImageSaveData {
  /** The uploaded image metadata */
  imageData: {
    url: string;
    filename?: string;
    size?: number;
    mime?: string;
    width?: number;
    height?: number;
  } | null;
}

/** Upload state machine - clearer than multiple boolean flags */
type UploadState = 'idle' | 'submitting-draft' | 'uploading';

/** Normalized image data from upload response */
interface NormalizedImageData {
  url: string;
  filename: string;
  size: number;
  mime: string;
  width?: number;
  height?: number;
}

/** Convert upload response to normalized image data */
function normalizeUploadResponse(data: UploadResponse): NormalizedImageData {
  return {
    url: data.url,
    filename: data.filename,
    size: data.size,
    mime: data.mimetype,
    width: data.width,
    height: data.height,
  };
}

interface ImageEditorProps {
  value: GridCell;
  onFinishedEditing: (newValue?: GridCell) => void;
  tableName?: string;
  fieldName?: string;
  recordId?: string | number;
  /** Called after successful upload with data for optimistic updates */
  onSaveComplete?: (data: ImageSaveData) => void;
  /** Whether this is a draft row (not yet persisted to database) */
  isDraftRow?: boolean;
  /**
   * Callback to submit draft row before uploading.
   * Required when isDraftRow is true and user wants to upload.
   * Returns the created row with real database ID.
   */
  onSubmitDraft?: () => Promise<DraftSubmitResult>;
  /**
   * Callback invoked after draft row creation AND upload complete.
   * Used to trigger data refresh after the entire workflow finishes.
   */
  onDraftUploadComplete?: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  value,
  onFinishedEditing,
  tableName,
  fieldName,
  recordId,
  onSaveComplete,
  isDraftRow = false,
  onSubmitDraft,
  onDraftUploadComplete,
}) => {
  // Single state for upload workflow - clearer than multiple booleans
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  // Get scopeKey for direct upload calls (needed when uploading after draft creation)
  const scopeKey = useDashboardCacheScopeKey();

  // Extract current image data from the Glide Image cell
  const currentImageData = value.kind === GridCellKind.Image ? value.data[0] : null;
  const [imageValue, setImageValue] = useState<unknown>(currentImageData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragErrors, setDragErrors] = useState<string[]>([]);

  // Derived state - cleaner than checking multiple flags
  const isSubmittingDraft = uploadState === 'submitting-draft';
  const isUploading = uploadState === 'uploading';
  const isBusy = uploadState !== 'idle';

  /** Shared success handler for both hook and direct upload paths */
  const handleUploadSuccess = useCallback((data: UploadResponse) => {
    const normalized = normalizeUploadResponse(data);
    setImageValue(normalized);
    setUploadProgress(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadState('idle');

    onSaveComplete?.({ imageData: normalized });
    onFinishedEditing();
    toast.success({ message: 'Image uploaded successfully' });
  }, [onSaveComplete, onFinishedEditing]);

  // Upload mutation hook - use field upload since we're always in table context
  const uploadMutation = useFieldUpload(tableName || '', fieldName || '', recordId || '', {
    onProgress: setUploadProgress,
    onSuccess: (data) => handleUploadSuccess(data),
    onError: () => {
      setUploadProgress(null);
      setUploadState('idle');
    },
    showToast: false,
  });

  const imageUrl = useMemo(() => getImageUrl(imageValue), [imageValue]);
  const imageMetadata = useMemo(() => getImageMetadata(imageValue), [imageValue]);

  const handleRemoveImage = useCallback(() => {
    setImageValue(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  const handleFileSelection = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error({ message: 'Please select an image file' });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error({ message: 'File size must be less than 10MB' });
        return;
      }

      // Set selected file and create preview URL
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragErrors([]);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelection(files);
      }
    },
    [handleFileSelection],
  );

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleFileSelection(files);
      }
    };
    input.click();
  }, [handleFileSelection]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDragErrors([]);
  }, []);

  // Handle the actual upload when user confirms
  // For draft rows: first submit the draft to create a real row, then upload with the new real ID
  const handleConfirmUpload = useCallback(async () => {
    if (!tableName || !fieldName) {
      toast.error({ message: 'Missing table/field context for upload' });
      return;
    }

    if (!selectedFile) {
      return;
    }

    // For draft rows, we need to submit the draft first to get a real ID
    if (isDraftRow) {
      if (!onSubmitDraft) {
        toast.error({ message: 'Cannot upload to draft row - save the row first' });
        return;
      }

      // Use a single loading toast for the entire operation
      toast.info({ message: 'Creating row...' });
      setUploadState('submitting-draft');

      try {
        const result = await onSubmitDraft();

        if (!result.createdRow?.id) {
          toast.error({ message: 'Failed to create row' });
          setUploadState('idle');
          return;
        }

        // Get the real ID from the created row
        const newRecordId = result.createdRow.id;

        // Now proceed with upload using the new real ID
        toast.info({ message: 'Uploading image...' });
        setUploadState('uploading');

        try {
          const uploadResult = await executeFieldUpload(
            tableName,
            fieldName,
            newRecordId,
            selectedFile,
            scopeKey,
          );

          // For draft rows: don't call onSaveComplete - the draft row index is stale
          // after submission. Instead, trigger data refresh via onDraftUploadComplete
          // which invalidates the cache AFTER the upload is done.
          const normalized = normalizeUploadResponse(uploadResult);
          setImageValue(normalized);
          setUploadProgress(null);
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadState('idle');

          // Trigger data refresh now that both row creation AND upload are complete
          onDraftUploadComplete?.();

          toast.success({ message: 'Row created and image uploaded' });
          onFinishedEditing();
        } catch (uploadError) {
          setUploadState('idle');
          const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload image';
          toast.error({ message });
        }
      } catch (error) {
        setUploadState('idle');
        const message = error instanceof Error ? error.message : 'Failed to create row';
        toast.error({ message });
      }
      return;
    }

    // Non-draft row: use the hook-based upload
    if (!recordId) {
      toast.error({ message: 'Missing record context for upload' });
      return;
    }
    setUploadState('uploading');
    uploadMutation.mutate(selectedFile);
  }, [selectedFile, uploadMutation, tableName, fieldName, recordId, isDraftRow, onSubmitDraft, scopeKey, onDraftUploadComplete, onFinishedEditing]);

  const handleSave = useCallback(() => {
    // If user removed the image, set field to null
    if (!imageValue) {
      onFinishedEditing({
        kind: GridCellKind.Image,
        data: [],
        displayData: [],
        allowOverlay: true,
        readonly: true,
      });
      return;
    }

    const url = getImageUrl(imageValue);
    const originalUrl = value.kind === GridCellKind.Image ? value.data?.[0] : null;

    // If nothing changed, close without triggering another mutation
    if (url && originalUrl === url) {
      onFinishedEditing();
      return;
    }

    if (url) {
      // Return updated Image cell with URL
      onFinishedEditing({
        kind: GridCellKind.Image,
        data: [url],
        displayData: [url],
        allowOverlay: true,
        readonly: true,
      });
    } else {
      // Fallback to original value if no valid URL
      onFinishedEditing(value);
    }
  }, [imageValue, value, onFinishedEditing]);

  const handleCancel = useCallback(() => {
    // Clean up preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Signal cancel without committing any value
    onFinishedEditing();
  }, [onFinishedEditing, previewUrl]);

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle Ctrl+Enter to save
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <EditorFocusTrap
      onEscape={handleCancel}
      className='bg-background flex w-96 max-w-lg flex-col gap-0 overflow-y-visible rounded-lg border border-border/70 p-0 shadow-lg ring-1 ring-border/30'
    >
      <div onKeyDown={handleEditorKeyDown}>
        {/* Header */}
        <div className='mb-4 border-b px-6 py-4'>
          <h3 className='text-base font-semibold'>{imageUrl ? 'Edit Image' : 'Add Image'}</h3>
        </div>

        <div className='overflow-y-auto'>
          {/* Unified Image Dropzone + Preview */}
          <div className='px-2 py-2'>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              className='border-input/70 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring
							has-[input:focus]:ring-ring/50 relative flex min-h-52 cursor-pointer flex-col items-center justify-center
							overflow-hidden rounded-xl border border-dashed p-0 transition-colors has-[input:focus]:ring-[3px]'
              onClick={isBusy ? undefined : openFileDialog}
            >
              <input
                type='file'
                accept='image/*'
                className='sr-only'
                aria-label='Upload image file'
                disabled={isBusy}
              />

              {isSubmittingDraft ? (
                <div
                  data-state='creating'
                  className='text-muted-foreground flex w-full flex-col items-center justify-center p-6'
                >
                  <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                  <p className='text-sm'>Creating row...</p>
                </div>
              ) : isUploading ? (
                <div
                  data-state='uploading'
                  className='text-muted-foreground flex w-full flex-col items-center justify-center p-6'
                >
                  <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                  <p className='text-sm'>Uploading image...</p>
                  {uploadProgress && (
                    <div className='mt-2 w-full max-w-xs'>
                      <div className='bg-muted h-2 rounded-full'>
                        <div
                          className='bg-primary h-2 rounded-full transition-all duration-300'
                          style={{ width: `${uploadProgress.percentage}%` }}
                        />
                      </div>
                      <p className='mt-1 text-center text-xs'>{Math.round(uploadProgress.percentage)}%</p>
                    </div>
                  )}
                </div>
              ) : previewUrl ? (
                <div className='relative h-56 w-full'>
                  <img
                    src={previewUrl}
                    alt={selectedFile?.name || 'Uploaded image'}
                    className='size-full object-contain'
                  />
                  {/* Remove selected file */}
                  <div className='absolute top-3 right-3'>
                    <button
                      type='button'
                      className='focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer
											items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow]
											outline-none hover:bg-black/80 focus-visible:ring-[3px]'
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      aria-label='Remove selected file'
                    >
                      <XIcon className='size-4' aria-hidden='true' />
                    </button>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className='relative h-56 w-full'>
                  <ImageWithFallback
                    src={imageUrl}
                    alt={imageMetadata?.filename || 'Preview'}
                    className='size-full object-contain'
                    wrapperClassName='w-full h-full'
                    loadingElement={
                      <div
                        data-part-id='image-editor-loading'
                        className='absolute inset-0 grid h-full w-full place-items-center'
                      >
                        <MotionGrid
                          gridSize={[4, 4]}
                          duration={120}
                          className='opacity-90'
                          cellClassName='size-2.5'
                          cellActiveClassName='bg-primary'
                          cellInactiveClassName='bg-muted'
                        />
                        <div className='text-muted-foreground absolute bottom-3 hidden text-xs'>Loading image…</div>
                      </div>
                    }
                    fallbackElement={
                      <div className='text-muted-foreground text-center'>
                        <ImageOff className='mx-auto mb-2 h-12 w-12' />
                        <p className='text-sm'>Unable to load image</p>
                        <p className='text-xs opacity-75'>Click to replace</p>
                      </div>
                    }
                  />
                  {/* Remove existing image */}
                  <div className='absolute top-3 right-3'>
                    <button
                      type='button'
                      className='focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer
											items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow]
											outline-none hover:bg-black/80 focus-visible:ring-[3px]'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      aria-label='Remove image'
                    >
                      <XIcon className='size-4' aria-hidden='true' />
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex w-full flex-col items-center justify-center px-4 py-6 text-center'>
                  <div
                    className='bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border'
                    aria-hidden='true'
                  >
                    <ImageIcon className='size-4 opacity-60' />
                  </div>
                  <p className='mb-1.5 text-sm font-medium'>Drop your image here</p>
                  <p className='text-muted-foreground text-xs'>SVG, PNG, JPG or GIF (max. 10MB)</p>
                  <Button
                    variant='outline'
                    className='mt-4'
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                    disabled={uploadMutation.isPending}
                  >
                    <UploadIcon className='-ms-1 size-4 opacity-60' aria-hidden='true' />
                    Select image
                  </Button>
                </div>
              )}
            </div>

            {/* Error display */}
            {dragErrors.length > 0 && (
              <div className='text-destructive mt-2 flex items-center gap-1 text-xs' role='alert'>
                <AlertCircleIcon className='size-3 shrink-0' />
                <span>{dragErrors[0]}</span>
              </div>
            )}

            {/* File or image metadata */}
            {!uploadMutation.isPending && (
              <div className='text-muted-foreground mt-2 text-center text-xs'>
                {selectedFile ? (
                  <>
                    <span className='font-medium'>{selectedFile.name}</span>
                    {' • '}
                    <span>{formatFileSize(selectedFile.size)}</span>
                    {' • '}
                    <span className='uppercase'>{selectedFile.type}</span>
                  </>
                ) : imageMetadata ? (
                  <>
                    <span className='font-medium'>{imageMetadata.filename}</span>
                    {imageMetadata.size ? (
                      <>
                        {' • '}
                        <span>{formatFileSize(imageMetadata.size)}</span>
                      </>
                    ) : null}
                    {imageMetadata.mime ? (
                      <>
                        {' • '}
                        <span className='uppercase'>{imageMetadata.mime}</span>
                      </>
                    ) : null}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-4 flex justify-end gap-2 border-t px-6 py-4'>
          <Button type='button' variant='outline' onClick={handleCancel} disabled={isBusy}>
            Cancel
          </Button>

          {/* Show upload confirmation button when file is selected and not busy */}
          {selectedFile && !isBusy && (
            <Button type='button' onClick={handleConfirmUpload}>
              {isDraftRow ? 'Create Row & Upload' : 'Upload & Save'}
            </Button>
          )}

          {/* Show regular save button when no file is selected or upload is in progress */}
          {(!selectedFile || isBusy) && (
            <Button type='button' onClick={handleSave} disabled={isBusy}>
              {isSubmittingDraft ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating row...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : imageUrl ? (
                'Save Changes'
              ) : (
                'Add Image'
              )}
            </Button>
          )}
        </div>
      </div>
    </EditorFocusTrap>
  );
};
