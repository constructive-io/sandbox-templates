'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RiGlobalLine } from '@remixicon/react';

import { buildOrgDatabaseRoute } from '@/app-routes';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import type { DatabaseService } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { useDatabaseServices } from '@/lib/gql/hooks/schema-builder/apis/use-database-services';
import { getDatabaseRouteKeyFromSection, getDatabaseSectionFromPathname, useEntityParams } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useEnv, useEnvActions } from '@/store/app-store';
import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';

interface DatabaseOption {
  key: string;
  label: string;
  description?: string;
}

export interface ApiSchemaInfo {
  id: string;
  name: string;
}

export interface ApiOption {
  id: string;
  name: string;
  url: string | null;
  domain?: string | null;
  subdomain?: string | null;
  isPublic: boolean | null;
  /** Schemas linked to this API (used for filtering by public/private schema) */
  schemata: ApiSchemaInfo[];
}

export interface DashboardContextState {
  currentDatabase: {
    schemaKey: string;
    databaseId: string;
    name: string;
    label: string | null;
    schemaName: string | null;
    schemaId: string | null;
  } | null;
  currentApi: ApiOption | null;
  databaseOptions: DatabaseOption[];
  selectedDatabaseKey: string | undefined;
  selectDatabase: (schemaKey: string) => void;
  apiOptions: ApiOption[];
  selectedApiId: string | null;
  selectApi: (apiId: string) => void;
  servicesLoading: boolean;
  servicesError: Error | null;
  refetchServices: () => Promise<unknown>;
  isLoadingSchemas: boolean;
  schemasError: Error | null;
  noDatabaseSelected: boolean;
  noApisAvailable: boolean;
  currentEndpoint: string | null;
  databaseServices: DatabaseService[];
}

export interface UseDashboardContextOptions {
  apiFilter?: (api: ApiOption) => boolean;
}

/**
 * Filter function to select only the "public" API.
 * Used in dashboard routes to ensure users operate against the correct API.
 * 
 * Note: We filter by API name (not schema linkage) because all APIs typically
 * have the "public" schema linked. The "public" API is the one intended for
 * end-user data operations.
 */
export function filterPublicApi(api: ApiOption): boolean {
  return api.name === 'public';
}

function buildGraphqlUrl(domain?: string | null, subdomain?: string | null): string | null {
  if (!domain) return null;
  const host = subdomain ? `${subdomain}.${domain}` : domain;
  const isLocalhost = host.includes('localhost');
  const protocol = isLocalhost ? 'http' : 'https';
  const needsPort = isLocalhost && !host.includes(':');
  const hostWithPort = needsPort ? `${host}:3000` : host;
  return `${protocol}://${hostWithPort}/graphql`;
}

function pickDefaultApiOption(options: ApiOption[], currentId: string | null | undefined): ApiOption | null {
  if (currentId) {
    const existing = options.find((option) => option.id === currentId);
    if (existing) return existing;
  }
  const withUrl = options.find((option) => option.url);
  return withUrl ?? options[0] ?? null;
}

export function useDashboardContext(options: UseDashboardContextOptions = {}): DashboardContextState {
  // Use selectors for derived data (availableSchemas, currentDatabase, isLoading)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { orgId } = useEntityParams();

  const {
    availableSchemas,
    currentDatabase,
    currentDatabaseApi,
    selectSchema,
    setCurrentDatabaseApi,
    isLoading: isLoadingSchemas,
    error: schemasError,
  } = useSchemaBuilderSelectors();
  const { apiFilter } = options;

  const databaseOptions = useMemo<DatabaseOption[]>(
    () =>
      availableSchemas
        .filter((schema) => schema.source === 'database')
        .map((schema) => ({
          key: schema.key,
          label: schema.databaseInfo?.label ?? schema.databaseInfo?.name ?? schema.name,
          description: schema.databaseInfo?.name ?? undefined,
        })),
    [availableSchemas],
  );

  const selectedDatabaseKey = currentDatabase?.schemaKey ?? undefined;
  const storedApi = currentDatabaseApi;

  const currentSection = useMemo(() => getDatabaseSectionFromPathname(pathname), [pathname]);

  const selectDatabase = useCallback(
    (schemaKey: string) => {
      if (schemaKey === selectedDatabaseKey) return;
      const schemaInfo = availableSchemas.find((schema) => schema.key === schemaKey);
      const databaseId = schemaInfo?.databaseInfo?.id ?? null;
      if (!orgId || !databaseId) {
        selectSchema(schemaKey);
        return;
      }

      const queryString = searchParams?.toString() ?? '';
      const nextSearchParams = new URLSearchParams(queryString);
      nextSearchParams.delete('table');
      nextSearchParams.delete('tableName');
      const nextQueryString = nextSearchParams.toString();

      const routeKey = getDatabaseRouteKeyFromSection(currentSection, 'data');
      const base = buildOrgDatabaseRoute(routeKey, orgId, databaseId);
      router.push((nextQueryString ? `${base}?${nextQueryString}` : base) as typeof base);
    },
    [
      availableSchemas,
      currentSection,
      orgId,
      router,
      searchParams,
      selectSchema,
      selectedDatabaseKey,
    ],
  );
  const currentDatabaseId = currentDatabase?.databaseId ?? '';

  const {
    services: databaseServices = [],
    isLoading: servicesLoading,
    error: servicesError,
    refetch,
  } = useDatabaseServices({
    databaseId: currentDatabaseId,
    enabled: Boolean(currentDatabaseId),
  });

  const rawApiOptions = useMemo<ApiOption[]>(
    () =>
      databaseServices.map((service) => {
        const domainNode = service.domains?.nodes?.find((node) => node?.domain) ?? null;
        // Extract schema info from apiSchemas relation
        const schemata: ApiSchemaInfo[] = (service.apiSchemas?.nodes ?? [])
          .filter((node: any) => node?.schema?.id && node?.schema?.name)
          .map((node: any) => ({
            id: node.schema!.id,
            name: node.schema!.name,
          }));
        return {
          id: service.id,
          name: service.name ?? 'Unnamed API',
          url: buildGraphqlUrl(domainNode?.domain ?? null, domainNode?.subdomain ?? null),
          domain: domainNode?.domain ?? null,
          subdomain: domainNode?.subdomain ?? null,
          isPublic: service.isPublic ?? null,
          schemata,
        };
      }),
    [databaseServices],
  );

  const apiOptions = useMemo(() => {
    if (!apiFilter) return rawApiOptions;
    return rawApiOptions.filter(apiFilter);
  }, [rawApiOptions, apiFilter]);

  const envActions = useEnvActions();
  const { getEffectiveEndpoint } = useEnv();

  const selectApi = useCallback(
    (apiId: string) => {
      const next = apiOptions.find((option) => option.id === apiId) ?? null;
      setCurrentDatabaseApi(next);
      envActions.setEndpointOverride('dashboard', next?.url ?? null);
    },
    [apiOptions, envActions, setCurrentDatabaseApi],
  );

  useEffect(() => {
    if (!currentDatabase) {
      setCurrentDatabaseApi(null);
      envActions.setEndpointOverride('dashboard', null);
      return;
    }
    if (servicesLoading || servicesError) return;
    if (apiOptions.length === 0) {
      if (storedApi) {
        setCurrentDatabaseApi(null);
      }
      envActions.setEndpointOverride('dashboard', null);
      return;
    }

    const matched = storedApi ? (apiOptions.find((option) => option.id === storedApi.id) ?? null) : null;

    if (matched && storedApi) {
      const needsUpdate =
        storedApi.name !== matched.name ||
        storedApi.url !== matched.url ||
        storedApi.domain !== matched.domain ||
        storedApi.subdomain !== matched.subdomain;
      if (needsUpdate) {
        setCurrentDatabaseApi(matched);
      }
      envActions.setEndpointOverride('dashboard', matched.url ?? null);
      return;
    }

    const next = pickDefaultApiOption(apiOptions, storedApi?.id ?? null);
    if (!next) {
      envActions.setEndpointOverride('dashboard', null);
      return;
    }
    setCurrentDatabaseApi(next);
    envActions.setEndpointOverride('dashboard', next.url ?? null);
  }, [apiOptions, currentDatabase, envActions, servicesError, servicesLoading, setCurrentDatabaseApi, storedApi]);

  const currentApi: ApiOption | null = useMemo(() => {
    if (!storedApi) return null;
    const matched = apiOptions.find((option) => option.id === storedApi.id);
    if (matched) return matched;
    // Fallback: stored API doesn't have schemata, use empty array
    // (schemata is only used for filtering, not display)
    return {
      id: storedApi.id,
      name: storedApi.name,
      url: storedApi.url,
      domain: storedApi.domain ?? null,
      subdomain: storedApi.subdomain ?? null,
      isPublic: storedApi.isPublic ?? null,
      schemata: [],
    };
  }, [apiOptions, storedApi]);

  const fallbackEndpoint = useMemo(() => getEffectiveEndpoint('dashboard'), [getEffectiveEndpoint]);
  const currentEndpoint = currentApi?.url ?? fallbackEndpoint ?? null;
  const noDatabaseSelected = !currentDatabase;
  const noApisAvailable = Boolean(currentDatabase && !servicesLoading && !servicesError && apiOptions.length === 0);
  const selectedApiId = currentApi?.id ?? null;

  return {
    currentDatabase,
    currentApi,
    databaseOptions,
    selectedDatabaseKey,
    selectDatabase,
    apiOptions,
    selectedApiId,
    selectApi,
    servicesLoading,
    servicesError,
    refetchServices: refetch,
    isLoadingSchemas,
    schemasError,
    noDatabaseSelected,
    noApisAvailable,
    currentEndpoint,
    databaseServices,
  };
}

export interface DashboardContextSelectorProps {
  context?: DashboardContextState;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  variant?: 'inline' | 'popover';
  triggerClassName?: string;
  apiFilter?: (api: ApiOption) => boolean;
}

export function DashboardContextSelector({
  context,
  orientation = 'horizontal',
  className,
  variant = 'inline',
  triggerClassName,
  apiFilter,
}: DashboardContextSelectorProps) {
  const defaultContext = useDashboardContext({ apiFilter });
  const ctx = context ?? defaultContext;
  const {
    databaseOptions,
    selectedDatabaseKey,
    selectDatabase,
    apiOptions,
    selectedApiId,
    selectApi,
    servicesLoading,
    servicesError,
    isLoadingSchemas,
    currentApi,
    currentEndpoint,
  } = ctx;

  const databaseDisabled = isLoadingSchemas || databaseOptions.length === 0;
  const apiDisabled = !selectedDatabaseKey || isLoadingSchemas || servicesLoading || apiOptions.length === 0;
  const databasePlaceholder = databaseDisabled
    ? isLoadingSchemas
      ? 'Loading databases...'
      : 'No databases available'
    : 'Select database';
  const endpointLabel = currentApi?.name ?? 'Default endpoint';
  const endpointUrl = currentEndpoint ?? 'Not connected';
  const apiPlaceholder = servicesLoading
    ? 'Loading APIs...'
    : apiOptions.length > 0
      ? 'Select API'
      : 'No APIs available';
  const selectedDatabaseOption = selectedDatabaseKey
    ? databaseOptions.find((option) => option.key === selectedDatabaseKey)
    : null;

  if (variant === 'popover') {
    const triggerLabel = selectedDatabaseOption?.label ?? (databaseDisabled ? databasePlaceholder : 'Select database');
    const triggerSubLabel = selectedApiId ? (currentApi?.name ?? '') : '';

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className={cn('h-8 w-full justify-start gap-2 rounded-md px-2.5 text-left', triggerClassName)}
          >
            <RiGlobalLine className='text-primary/70 h-3.5 w-3.5 shrink-0' />
            <div className='flex min-w-0 flex-1 items-center gap-1.5'>
              <span className='truncate text-[13px] font-medium'>{triggerLabel}</span>
              {triggerSubLabel && (
                <Badge
                  variant='outline'
                  className='border-primary/15 bg-primary/5 text-primary h-4 shrink-0 px-1.5 text-[10px] font-medium'
                >
                  {triggerSubLabel}
                </Badge>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-80 space-y-4 p-4', className)} align='start'>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Database</p>
            <Select value={selectedDatabaseKey} onValueChange={selectDatabase} disabled={databaseDisabled}>
              <SelectTrigger className='h-9 w-full'>
                <SelectValue placeholder={databasePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {databaseOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>API</p>
            <Select value={selectedApiId ?? undefined} onValueChange={selectApi} disabled={apiDisabled}>
              <SelectTrigger className='h-9 w-full'>
                <SelectValue placeholder={apiPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {apiOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Endpoint</p>
            <p className='text-muted-foreground font-mono text-xs break-all'>{endpointUrl}</p>
          </div>
          {apiOptions.length > 0 ? (
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs font-medium uppercase'>Available APIs</p>
              <div className='max-h-32 space-y-1 overflow-y-auto pr-1'>
                {apiOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'rounded-md border px-2 py-1 text-sm',
                      option.id === selectedApiId ? 'border-primary bg-primary/5' : 'border-border/60',
                    )}
                  >
                    <p className='font-medium'>{option.name}</p>
                    <p className='text-muted-foreground font-mono text-xs break-all'>{option.url ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {servicesError ? (
            <p className='text-destructive text-xs'>Failed to load services: {servicesError.message}</p>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  }

  const isHorizontal = orientation === 'horizontal';
  const containerClass = cn(
    'flex w-full gap-3',
    isHorizontal ? 'flex-col sm:flex-row sm:items-center sm:gap-3' : 'flex-col',
    className,
  );

  return (
    <div className={containerClass}>
      <div className={cn('flex gap-2', isHorizontal ? 'flex-col sm:flex-row sm:items-center' : 'flex-col')}>
        <Select value={selectedDatabaseKey} onValueChange={selectDatabase} disabled={databaseDisabled}>
          <SelectTrigger className='h-9 w-full min-w-50 sm:w-64'>
            <SelectValue placeholder={databasePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {databaseOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedApiId ?? undefined} onValueChange={selectApi} disabled={apiDisabled}>
          <SelectTrigger className='h-9 w-full min-w-50 sm:w-56'>
            <SelectValue placeholder={apiPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {apiOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='h-9 justify-start gap-2 px-3'>
            <RiGlobalLine className='h-4 w-4 shrink-0' />
            <span className='truncate text-sm font-medium'>{endpointLabel}</span>
            <Badge variant='outline' className='ml-auto h-5 px-1.5 text-xs font-semibold'>
              {apiOptions.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-80 space-y-4 p-4'>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Current endpoint</p>
            <p className='font-mono text-sm break-all'>{endpointUrl}</p>
          </div>
          <div className='space-y-1'>
            <p className='text-muted-foreground text-xs font-medium uppercase'>Service</p>
            <p className='text-sm font-medium'>{currentApi?.name ?? 'Default'}</p>
            {currentApi?.domain ? (
              <p className='text-muted-foreground text-xs'>
                {currentApi.subdomain ? `${currentApi.subdomain}.` : ''}
                {currentApi.domain}
              </p>
            ) : null}
            {currentApi?.isPublic ? (
              <Badge variant='outline' className='mt-1 w-fit text-[10px]'>
                Public
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='mt-1 w-fit border-yellow-500/20 bg-yellow-500/10 text-[10px] text-yellow-500'
              >
                Private
              </Badge>
            )}
          </div>
          {apiOptions.length > 0 ? (
            <div className='space-y-1'>
              <p className='text-muted-foreground text-xs font-medium uppercase'>Available APIs</p>
              <div className='max-h-40 space-y-1 overflow-y-auto pr-1'>
                {apiOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'rounded-md border px-2 py-1',
                      option.id === selectedApiId ? 'border-primary bg-primary/5' : 'border-border/60',
                    )}
                  >
                    <p className='text-sm font-medium'>{option.name}</p>
                    <p className='text-muted-foreground font-mono text-xs break-all'>{option.url ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {servicesError ? (
            <p className='text-destructive text-xs'>Failed to load services: {servicesError.message}</p>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
