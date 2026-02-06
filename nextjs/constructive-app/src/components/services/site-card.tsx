'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { CardComponent } from '@constructive-io/ui/stack';

import type { DatabaseSite } from '@/lib/gql/hooks/schema-builder/sites';
import { useCreateSite, type CreateSiteData } from '@/lib/gql/hooks/schema-builder/sites/use-create-site';
import { useUpdateSite } from '@/lib/gql/hooks/schema-builder/sites/use-update-site';
import { siteModuleQueryKeys, siteThemeQueryKeys } from '@/lib/gql/hooks/schema-builder/sites';
import {
	useCreateSiteModuleMutation,
	useCreateSiteThemeMutation,
	useDeleteSiteModuleMutation,
	useDeleteSiteThemeMutation,
	useUpdateSiteModuleMutation,
	useUpdateSiteThemeMutation,
} from '@sdk/api';
import { Button } from '@constructive-io/ui/button';
import { Input } from '@constructive-io/ui/input';
import { JsonInput, validateJson } from '@constructive-io/ui/json-input';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Textarea } from '@constructive-io/ui/textarea';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';

import { ImageField, type ImageFieldState } from './image-field';
import { getMimeFromUrl } from './services.utils';

export type SiteCardProps = {
  databaseId: string;
  editingSite: DatabaseSite | null;
  onSuccess: () => void;
};

export const SiteCard: CardComponent<SiteCardProps> = ({ databaseId, editingSite, onSuccess, card }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<ImageFieldState>({ url: '', file: null, preview: null });
  const [ogImage, setOgImage] = useState<ImageFieldState>({ url: '', file: null, preview: null });
  const [favicon, setFavicon] = useState<ImageFieldState>({ url: '', file: null, preview: null });
  const [appleTouchIcon, setAppleTouchIcon] = useState<ImageFieldState>({ url: '', file: null, preview: null });
  const [siteModuleJson, setSiteModuleJson] = useState('');
  const [siteThemeJson, setSiteThemeJson] = useState('');
  const [showMore, setShowMore] = useState(false);

  const queryClient = useQueryClient();
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const createSiteModule = useCreateSiteModuleMutation({
    onSuccess: (result) => {
      const siteId = result.createSiteModule?.siteModule?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: siteModuleQueryKeys.bySite(siteId) });
      }
    },
  });
  const updateSiteModule = useUpdateSiteModuleMutation({
    onSuccess: (result) => {
      const siteId = result.updateSiteModule?.siteModule?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: siteModuleQueryKeys.bySite(siteId) });
      }
    },
  });
  const deleteSiteModule = useDeleteSiteModuleMutation();
  const createSiteTheme = useCreateSiteThemeMutation({
    onSuccess: (result) => {
      const siteId = result.createSiteTheme?.siteTheme?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: siteThemeQueryKeys.bySite(siteId) });
      }
    },
  });
  const updateSiteTheme = useUpdateSiteThemeMutation({
    onSuccess: (result) => {
      const siteId = result.updateSiteTheme?.siteTheme?.siteId;
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: siteThemeQueryKeys.bySite(siteId) });
      }
    },
  });
  const deleteSiteTheme = useDeleteSiteThemeMutation();

  const existingModules = editingSite?.modules || [];
  const existingTheme = editingSite?.theme || null;

  const isEditMode = Boolean(editingSite);

  const isJsonValid =
    (siteModuleJson.trim().length === 0 || validateJson(siteModuleJson) === null) &&
    (siteThemeJson.trim().length === 0 || validateJson(siteThemeJson) === null);
  const isValid = title.trim() !== '' && isJsonValid;
  const isLoading =
    createSite.isPending ||
    updateSite.isPending ||
    createSiteModule.isPending ||
    updateSiteModule.isPending ||
    deleteSiteModule.isPending ||
    createSiteTheme.isPending ||
    updateSiteTheme.isPending ||
    deleteSiteTheme.isPending;

  const handleFileChange = (field: 'logo' | 'ogImage' | 'favicon' | 'appleTouchIcon', file: File | null) => {
    const setState = {
      logo: setLogo,
      ogImage: setOgImage,
      favicon: setFavicon,
      appleTouchIcon: setAppleTouchIcon,
    }[field];

    if (file) {
      const preview = URL.createObjectURL(file);
      setState({ url: '', file, preview });
    } else {
      setState({ url: '', file: null, preview: null });
    }
  };

  const handleUrlChange = (field: 'logo' | 'ogImage' | 'favicon' | 'appleTouchIcon', url: string) => {
    const setState = {
      logo: setLogo,
      ogImage: setOgImage,
      favicon: setFavicon,
      appleTouchIcon: setAppleTouchIcon,
    }[field];

    setState({ url, file: null, preview: null });
  };

  const handleRemove = (field: 'logo' | 'ogImage' | 'favicon' | 'appleTouchIcon') => {
    const state = { logo, ogImage, favicon, appleTouchIcon }[field];
    if (state.preview) {
      URL.revokeObjectURL(state.preview);
    }
    const setState = {
      logo: setLogo,
      ogImage: setOgImage,
      favicon: setFavicon,
      appleTouchIcon: setAppleTouchIcon,
    }[field];
    setState({ url: '', file: null, preview: null });
  };

  useEffect(() => {
    if (editingSite) {
      const site = editingSite as any;
      setTitle(site.title ?? '');
      setDescription(site.description ?? '');

      if (site.logo?.url) {
        setLogo({ url: site.logo.url, file: null, preview: null });
      }
      if (site.ogImage?.url) {
        setOgImage({ url: site.ogImage.url, file: null, preview: null });
      }
      if (site.favicon) {
        setFavicon({ url: site.favicon, file: null, preview: null });
      }
      if (site.appleTouchIcon?.url) {
        setAppleTouchIcon({ url: site.appleTouchIcon.url, file: null, preview: null });
      }

      if (existingModules.length > 0) {
        setSiteModuleJson(JSON.stringify(existingModules[0].data, null, 2));
      }
      if (existingTheme) {
        setSiteThemeJson(JSON.stringify(existingTheme.theme, null, 2));
      }
    }
  }, [editingSite, existingModules, existingTheme]);

  useEffect(() => {
    return () => {
      if (logo.preview) URL.revokeObjectURL(logo.preview);
      if (ogImage.preview) URL.revokeObjectURL(ogImage.preview);
      if (favicon.preview) URL.revokeObjectURL(favicon.preview);
      if (appleTouchIcon.preview) URL.revokeObjectURL(appleTouchIcon.preview);
    };
  }, [logo.preview, ogImage.preview, favicon.preview, appleTouchIcon.preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      showErrorToast({
        message: 'Invalid input',
        description: 'Site title is required.',
      });
      return;
    }

    try {
      let siteId = editingSite?.id;

      if (isEditMode && editingSite?.id) {
        const updateInput: any = {
          id: editingSite.id,
          databaseId,
          title: title.trim(),
          description: description.trim(),
        };

        if (logo.file) {
          updateInput.logoUpload = logo.file;
        } else if (logo.url) {
          updateInput.logo = { url: logo.url, mime: getMimeFromUrl(logo.url) };
        }

        if (ogImage.file) {
          updateInput.ogImageUpload = ogImage.file;
        } else if (ogImage.url) {
          updateInput.ogImage = { url: ogImage.url, mime: getMimeFromUrl(ogImage.url) };
        }

        if (favicon.file) {
          updateInput.faviconUpload = favicon.file;
        } else if (favicon.url) {
          updateInput.favicon = favicon.url;
        }

        if (appleTouchIcon.file) {
          updateInput.appleTouchIconUpload = appleTouchIcon.file;
        } else if (appleTouchIcon.url) {
          updateInput.appleTouchIcon = {
            url: appleTouchIcon.url,
            mime: getMimeFromUrl(appleTouchIcon.url),
          };
        }

        await updateSite.mutateAsync(updateInput);

        const hasSiteModuleInput = siteModuleJson.trim().length > 0;
        const existingModule = existingModules.length > 0 ? existingModules[0] : null;

        if (hasSiteModuleInput && existingModule) {
          const moduleData = JSON.parse(siteModuleJson);
          await updateSiteModule.mutateAsync({
            input: {
              id: existingModule.id,
              patch: { data: moduleData },
            },
          });
        } else if (hasSiteModuleInput && !existingModule) {
          const moduleData = JSON.parse(siteModuleJson);
          await createSiteModule.mutateAsync({
            input: {
              siteModule: {
                databaseId,
                siteId: siteId!,
                name: `${title.trim()}_module`,
                data: moduleData,
              },
            },
          });
        } else if (!hasSiteModuleInput && existingModule) {
          await deleteSiteModule.mutateAsync({
            input: { id: existingModule.id },
          });
        }

        const hasSiteThemeInput = siteThemeJson.trim().length > 0;

        if (hasSiteThemeInput && existingTheme) {
          const themeData = JSON.parse(siteThemeJson);
          await updateSiteTheme.mutateAsync({
            input: {
              id: existingTheme.id,
              patch: { theme: themeData },
            },
          });
        } else if (hasSiteThemeInput && !existingTheme) {
          const themeData = JSON.parse(siteThemeJson);
          await createSiteTheme.mutateAsync({
            input: {
              siteTheme: {
                databaseId,
                siteId: siteId!,
                theme: themeData,
              },
            },
          });
        } else if (!hasSiteThemeInput && existingTheme) {
          await deleteSiteTheme.mutateAsync({
            input: { id: existingTheme.id },
          });
        }

        showSuccessToast({
          message: 'Site updated successfully',
          description: `${title.trim()} has been updated.`,
        });
      } else {
        const input: CreateSiteData = {
          databaseId,
          title: title.trim(),
          description: description.trim(),
        };

        if (logo.file) {
          input.logoUpload = logo.file;
        } else if (logo.url) {
          input.logo = { url: logo.url, mime: getMimeFromUrl(logo.url) };
        }

        if (ogImage.file) {
          input.ogImageUpload = ogImage.file;
        } else if (ogImage.url) {
          input.ogImage = { url: ogImage.url, mime: getMimeFromUrl(ogImage.url) };
        }

        if (favicon.file) {
          input.faviconUpload = favicon.file;
        } else if (favicon.url) {
          input.favicon = favicon.url;
        }

        if (appleTouchIcon.file) {
          input.appleTouchIconUpload = appleTouchIcon.file;
        } else if (appleTouchIcon.url) {
          input.appleTouchIcon = {
            url: appleTouchIcon.url,
            mime: getMimeFromUrl(appleTouchIcon.url),
          };
        }

        const createdSite = await createSite.mutateAsync(input);
        siteId = createdSite.id;

        if (siteId) {
          if (siteModuleJson.trim().length > 0) {
            const moduleData = JSON.parse(siteModuleJson);
            await createSiteModule.mutateAsync({
              input: {
                siteModule: {
                  databaseId,
                  siteId,
                  name: `${title.trim()}_module`,
                  data: moduleData,
                },
              },
            });
          }

          if (siteThemeJson.trim().length > 0) {
            const themeData = JSON.parse(siteThemeJson);
            await createSiteTheme.mutateAsync({
              input: {
                siteTheme: {
                  databaseId,
                  siteId,
                  theme: themeData,
                },
              },
            });
          }
        }

        showSuccessToast({
          message: 'Site created successfully',
          description: `${title.trim()} has been created.`,
        });
      }

      onSuccess();
      card.close();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} site:`, error);
      showErrorToast({
        message: `Failed to ${isEditMode ? 'update' : 'create'} site`,
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <form id='site-form' onSubmit={handleSubmit} className='space-y-6 p-6'>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>
                Site Title <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='title'
                placeholder='My Awesome Site'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete='off'
                disabled={isLoading}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='A short description about what this site is for.'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete='off'
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-base font-medium'>Icons</h3>

              <ImageField
                label='Logo'
                placeholder='Enter logo URL'
                state={logo}
                onUrlChange={(url) => handleUrlChange('logo', url)}
                onFileChange={(file) => handleFileChange('logo', file)}
                onRemove={() => handleRemove('logo')}
                disabled={isLoading}
              />

              <ImageField
                label='OG Image'
                placeholder='Enter OG image URL'
                state={ogImage}
                onUrlChange={(url) => handleUrlChange('ogImage', url)}
                onFileChange={(file) => handleFileChange('ogImage', file)}
                onRemove={() => handleRemove('ogImage')}
                disabled={isLoading}
              />

              <ImageField
                label='Favicon'
                placeholder='Enter favicon URL'
                state={favicon}
                onUrlChange={(url) => handleUrlChange('favicon', url)}
                onFileChange={(file) => handleFileChange('favicon', file)}
                onRemove={() => handleRemove('favicon')}
                disabled={isLoading}
              />

              <ImageField
                label='Apple Touch Icon'
                placeholder='Enter icon URL'
                state={appleTouchIcon}
                onUrlChange={(url) => handleUrlChange('appleTouchIcon', url)}
                onFileChange={(file) => handleFileChange('appleTouchIcon', file)}
                onRemove={() => handleRemove('appleTouchIcon')}
                disabled={isLoading}
              />
            </div>

            {showMore && (
              <>
                <div className='mt-2 h-px border opacity-50' />
                <div className='grid gap-2'>
                  <Label htmlFor='siteModule'>Site Module</Label>
                  <JsonInput value={siteModuleJson} setValue={setSiteModuleJson} minLines={8} />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='siteTheme'>Site Theme</Label>
                  <JsonInput value={siteThemeJson} setValue={setSiteThemeJson} minLines={8} />
                </div>
              </>
            )}

            <Button
              type='button'
              variant='ghost'
              onClick={() => setShowMore((prev) => !prev)}
              className='text-muted-foreground hover:text-foreground -mt-2 w-full justify-center gap-2 hover:bg-transparent'
            >
              <span>{showMore ? 'Show less' : 'Show more'}</span>
              {showMore ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
            </Button>
          </div>
        </form>
      </ScrollArea>

      <div className='flex justify-end gap-2 border-t p-4'>
        <Button type='button' variant='outline' disabled={isLoading} onClick={() => card.close()}>
          Cancel
        </Button>
        <Button type='submit' form='site-form' disabled={isLoading || !isValid}>
          {isLoading && <Loader2Icon className='h-4 w-4 animate-spin' />}
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
