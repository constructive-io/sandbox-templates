'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CardComponent } from '@constructive-io/ui/stack';

import type { DatabaseApp, DatabaseSite } from '@/lib/gql/hooks/schema-builder/sites';
import { appQueryKeys } from '@/lib/gql/hooks/schema-builder/sites';
import {
	useCreateAppMutation,
	useUpdateAppMutation,
} from '@sdk/app-public';
import { Button } from '@constructive-io/ui/button';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from '@constructive-io/ui/combobox';
import { Input } from '@constructive-io/ui/input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import { ImageField, type ImageFieldState } from './image-field';
import { getMimeFromUrl } from './services.utils';

export type AppCardProps = {
  databaseId: string;
  sites: DatabaseSite[];
  editingApp: DatabaseApp | null;
  onSuccess: () => void;
};

export const AppCard: CardComponent<AppCardProps> = ({ databaseId, sites, editingApp, onSuccess, card }) => {
  const [name, setName] = useState('');
  const [appStoreLink, setAppStoreLink] = useState('');
  const [appStoreId, setAppStoreId] = useState('');
  const [appIdPrefix, setAppIdPrefix] = useState('');
  const [playStoreLink, setPlayStoreLink] = useState('');
  const [appImage, setAppImage] = useState<ImageFieldState>({ url: '', file: null, preview: null });
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const queryClient = useQueryClient();
  const createApp = useCreateAppMutation({
    onSuccess: (result) => {
      const siteId = result.createApp?.app?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bySite(siteId) });
      }
    },
  });
  const updateApp = useUpdateAppMutation({
    onSuccess: (result) => {
      const siteId = result.updateApp?.app?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: appQueryKeys.bySite(siteId) });
      }
    },
  });

  const isEditMode = Boolean(editingApp);
  const isValid = name.trim() !== '' && selectedSiteId !== '';
  const isLoading = createApp.isPending || updateApp.isPending;

  const handleFileChange = (file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setAppImage({ url: '', file, preview });
    } else {
      setAppImage({ url: '', file: null, preview: null });
    }
  };

  const handleUrlChange = (url: string) => {
    setAppImage({ url, file: null, preview: null });
  };

  const handleRemove = () => {
    if (appImage.preview) {
      URL.revokeObjectURL(appImage.preview);
    }
    setAppImage({ url: '', file: null, preview: null });
  };

  useEffect(() => {
    if (editingApp) {
      const app = editingApp as any;
      setName(app.name ?? '');
      setAppStoreLink(app.appStoreLink ?? '');
      setAppStoreId(app.appStoreId ?? '');
      setAppIdPrefix(app.appIdPrefix ?? '');
      setPlayStoreLink(app.playStoreLink ?? '');
      setSelectedSiteId(app.siteId ?? '');

      if (app.appImage?.url) {
        setAppImage({ url: app.appImage.url, file: null, preview: null });
      } else if (typeof app.appImage === 'string' && app.appImage) {
        setAppImage({ url: app.appImage, file: null, preview: null });
      }
    }
  }, [editingApp]);

  useEffect(() => {
    return () => {
      if (appImage.preview) URL.revokeObjectURL(appImage.preview);
    };
  }, [appImage.preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      showErrorToast({
        message: 'Invalid input',
        description: 'App name and site selection are required.',
      });
      return;
    }

    try {
      if (isEditMode && editingApp?.id) {
        const patch: Record<string, unknown> = {
          name: name.trim(),
        };

        if (appImage.url) {
          patch.appImage = { url: appImage.url, mime: getMimeFromUrl(appImage.url) };
        }

        if (appStoreLink.trim()) patch.appStoreLink = appStoreLink.trim();
        if (appStoreId.trim()) patch.appStoreId = appStoreId.trim();
        if (appIdPrefix.trim()) patch.appIdPrefix = appIdPrefix.trim();
        if (playStoreLink.trim()) patch.playStoreLink = playStoreLink.trim();

        await updateApp.mutateAsync({
          input: {
            id: editingApp.id,
            patch,
          },
        });

        showSuccessToast({
          message: 'App updated successfully',
          description: `${name.trim()} has been updated.`,
        });
      } else {
        const app: Record<string, unknown> = {
          databaseId,
          siteId: selectedSiteId,
          name: name.trim(),
        };

        if (appImage.url) {
          app.appImage = { url: appImage.url, mime: getMimeFromUrl(appImage.url) };
        }

        if (appStoreLink.trim()) app.appStoreLink = appStoreLink.trim();
        if (appStoreId.trim()) app.appStoreId = appStoreId.trim();
        if (appIdPrefix.trim()) app.appIdPrefix = appIdPrefix.trim();
        if (playStoreLink.trim()) app.playStoreLink = playStoreLink.trim();

        await createApp.mutateAsync({
          input: { app },
        });

        showSuccessToast({
          message: 'App created successfully',
          description: `${name.trim()} has been created.`,
        });
      }

      onSuccess();
      card.close();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} app:`, error);
      showErrorToast({
        message: `Failed to ${isEditMode ? 'update' : 'create'} app`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site.id,
        label: site.title ?? 'Untitled Site',
      })),
    [sites],
  );

  const selectedSiteOption = siteOptions.find((o) => o.value === selectedSiteId) ?? null;

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <form id='app-form' onSubmit={handleSubmit} className='space-y-6 p-6'>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>
                App Name <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='name'
                placeholder='My Awesome App'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='site'>
                Site <span className='text-destructive'>*</span>
              </Label>
              <Combobox
                items={siteOptions}
                value={selectedSiteOption}
                onValueChange={(next) => setSelectedSiteId(next?.value ?? '')}
              >
                <ComboboxInput placeholder='Select a site...' disabled={isLoading} />
                <ComboboxPopup>
                  <ComboboxEmpty>No sites found.</ComboboxEmpty>
                  <ComboboxList>
                    {(option: (typeof siteOptions)[number]) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxPopup>
              </Combobox>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='appStoreLink'>App Store Link</Label>
              <Input
                id='appStoreLink'
                placeholder='https://apps.apple.com/...'
                value={appStoreLink}
                onChange={(e) => setAppStoreLink(e.target.value)}
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='appStoreId'>App Store ID</Label>
              <Input
                id='appStoreId'
                placeholder='1234567890'
                value={appStoreId}
                onChange={(e) => setAppStoreId(e.target.value)}
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='appIdPrefix'>App ID Prefix</Label>
              <Input
                id='appIdPrefix'
                placeholder='com.example'
                value={appIdPrefix}
                onChange={(e) => setAppIdPrefix(e.target.value)}
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='playStoreLink'>Play Store Link</Label>
              <Input
                id='playStoreLink'
                placeholder='https://play.google.com/store/apps/...'
                value={playStoreLink}
                onChange={(e) => setPlayStoreLink(e.target.value)}
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <ImageField
              label='App Image'
              placeholder='Enter app image URL'
              state={appImage}
              onUrlChange={handleUrlChange}
              onFileChange={handleFileChange}
              onRemove={handleRemove}
              disabled={isLoading}
            />
          </div>
        </form>
      </ScrollArea>

      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' disabled={isLoading} onClick={() => card.close()}>
          Cancel
        </Button>
        <Button type='submit' form='app-form' disabled={isLoading || !isValid}>
          {isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
