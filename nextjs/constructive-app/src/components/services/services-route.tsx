'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Database, Filter, Globe, LayoutTemplate, Plus, Search, Server as ServerIcon, Smartphone, X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import {
  accessibleDatabasesQueryKeys,
  databaseConstraintsQueryKeys,
  useSchemaBuilderSelectors,
  userDatabasesQueryKeys,
} from '@/lib/gql/hooks/schema-builder';
import { useDatabaseServices } from '@/lib/gql/hooks/schema-builder/apis';
import { useDatabaseSchemas } from '@/lib/gql/hooks/schema-builder/schemas';
import { useDatabaseSitesAndApps } from '@/lib/gql/hooks/schema-builder/sites';
import { useDomainsQuery } from '@sdk/api';

import { cn } from '@/lib/utils';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { Button } from '@constructive-io/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { ScrollArea } from '@constructive-io/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { useCardStack } from '@constructive-io/ui/stack';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';

import { ApisSection } from './apis-section';
import { AppsSection } from './apps-sections';
import { ApiCard } from './api-card';
import { AppCard } from './app-card';
import { DomainCard } from './domain-card';
import { DomainsSection } from './domains-section';
import { SchemaCard } from './schema-card';
import { SchemasSection } from './schemas-section';
import { SiteCard } from './site-card';
import type { DomainItem } from './services.utils';
import { buildDomainLabel, formatAppPlatform } from './services.utils';
import { ServicesStateDisplay } from './services-state-display';
import { SitesSection } from './sites-section';

type ServiceTab = 'schemas' | 'apis' | 'domains' | 'sites' | 'apps';

interface TabConfig {
  id: ServiceTab;
  label: string;
  icon: React.ElementType;
  count: number;
  isLoading: boolean;
  actionLabel: string;
}

interface FilterDropdown {
  key: string;
  label: string;
  allLabel: string;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}

const TAB_FILTERS: Record<ServiceTab, FilterDropdown[]> = {
  schemas: [
    {
      key: 'apiLink',
      label: 'API Link',
      allLabel: 'All schemas',
      options: [
        { value: 'linked', label: 'Linked to API' },
        { value: 'unlinked', label: 'Not linked' },
      ],
    },
  ],
  apis: [
    {
      key: 'visibility',
      label: 'Visibility',
      allLabel: 'All APIs',
      options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
      ],
    },
    {
      key: 'schemas',
      label: 'Schemas',
      allLabel: 'Any schemas',
      options: [
        { value: 'hasSchemas', label: 'Has schemas' },
        { value: 'noSchemas', label: 'No schemas' },
      ],
    },
  ],
  domains: [
    {
      key: 'apiLink',
      label: 'API Link',
      allLabel: 'All domains',
      options: [
        { value: 'linked', label: 'Linked to API' },
        { value: 'unlinked', label: 'Not linked' },
      ],
    },
    {
      key: 'subdomain',
      label: 'Subdomain',
      allLabel: 'Any subdomain',
      options: [
        { value: 'hasSub', label: 'Has subdomain' },
        { value: 'rootOnly', label: 'Root only' },
      ],
    },
  ],
  sites: [
    {
      key: 'appLink',
      label: 'App link',
      allLabel: 'All sites',
      options: [
        { value: 'hasApp', label: 'Has app' },
        { value: 'noApp', label: 'No app' },
      ],
    },
    {
      key: 'modules',
      label: 'Modules',
      allLabel: 'Any modules',
      options: [
        { value: 'hasModules', label: 'Has modules' },
        { value: 'noModules', label: 'No modules' },
      ],
    },
  ],
  apps: [
    {
      key: 'platform',
      label: 'Platform',
      allLabel: 'All platforms',
      options: [
        { value: 'ios', label: 'iOS' },
        { value: 'android', label: 'Android' },
      ],
    },
  ],
};

export function ServicesRoute() {
  const [activeTab, setActiveTab] = useState<ServiceTab>('apis');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({ visibility: 'public' });
  const queryClient = useQueryClient();
  const stack = useCardStack();

  const { currentDatabase, error: databaseErrorRaw, isLoading: isDatabasesLoading } = useSchemaBuilderSelectors();

  const refetchDatabases = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: userDatabasesQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: accessibleDatabasesQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: databaseConstraintsQueryKeys.all });
  }, [queryClient]);

  const databaseError =
    databaseErrorRaw instanceof Error
      ? databaseErrorRaw
      : databaseErrorRaw
        ? new Error(String(databaseErrorRaw))
        : null;

  const databaseId = currentDatabase?.databaseId ?? '';
  const hasDatabase = Boolean(databaseId);

  const {
    services,
    totalCount: servicesTotal,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useDatabaseServices({ databaseId, enabled: hasDatabase });

  const {
    data: domainsData,
    isLoading: domainsLoading,
    error: domainsErrorRaw,
    refetch: refetchDomains,
  } = useDomainsQuery({ condition: { databaseId } }, { enabled: hasDatabase });

  const {
    data: sitesAndApps,
    isLoading: sitesAndAppsLoading,
    error: sitesAndAppsErrorRaw,
    refetch: refetchSitesAndApps,
  } = useDatabaseSitesAndApps(databaseId, { enabled: hasDatabase });

  const {
    schemas,
    totalCount: schemasTotal,
    isLoading: schemasLoading,
    error: schemasErrorRaw,
    refetch: refetchSchemas,
  } = useDatabaseSchemas({ databaseId, enabled: hasDatabase });

  const apps = sitesAndApps?.apps ?? [];
  const sites = sitesAndApps?.sites ?? [];
  const domainsList = (domainsData?.domains?.nodes ?? []) as DomainItem[];

  const sectionLoading = servicesLoading || domainsLoading || sitesAndAppsLoading || schemasLoading;
  const schemasError =
    schemasErrorRaw instanceof Error ? schemasErrorRaw : schemasErrorRaw ? new Error(String(schemasErrorRaw)) : null;
  const domainsError =
    domainsErrorRaw instanceof Error ? domainsErrorRaw : domainsErrorRaw ? new Error(String(domainsErrorRaw)) : null;
  const sitesAndAppsError =
    sitesAndAppsErrorRaw instanceof Error
      ? sitesAndAppsErrorRaw
      : sitesAndAppsErrorRaw
        ? new Error(String(sitesAndAppsErrorRaw))
        : null;

  const isInitialLoading = isDatabasesLoading && !currentDatabase;

  // ── Filtered data ──────────────────────────────────────────────────────
  const filteredSchemas = useMemo(() => {
    let result = schemas;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.schemaName.toLowerCase().includes(q) ||
          s.label?.toLowerCase().includes(q),
      );
    }
    const apiLink = filterValues.apiLink;
    if (apiLink === 'linked') result = result.filter((s) => (s.apiSchemas?.nodes?.length ?? 0) > 0);
    if (apiLink === 'unlinked') result = result.filter((s) => (s.apiSchemas?.nodes?.length ?? 0) === 0);
    return result;
  }, [schemas, searchQuery, filterValues]);

  const filteredServices = useMemo(() => {
    let result = services;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.roleName?.toLowerCase().includes(q),
      );
    }
    const vis = filterValues.visibility;
    if (vis === 'public') result = result.filter((s) => s.isPublic);
    if (vis === 'private') result = result.filter((s) => !s.isPublic);
    const sch = filterValues.schemas;
    if (sch === 'hasSchemas') result = result.filter((s) => (s.apiSchemas?.totalCount ?? 0) > 0);
    if (sch === 'noSchemas') result = result.filter((s) => (s.apiSchemas?.totalCount ?? 0) === 0);
    return result;
  }, [services, searchQuery, filterValues]);

  const filteredDomains = useMemo(() => {
    let result = domainsList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          buildDomainLabel(d).toLowerCase().includes(q) || d.subdomain?.toLowerCase().includes(q),
      );
    }
    const apiLink = filterValues.apiLink;
    if (apiLink === 'linked') result = result.filter((d) => Boolean(d.apiId));
    if (apiLink === 'unlinked') result = result.filter((d) => !d.apiId);
    const sub = filterValues.subdomain;
    if (sub === 'hasSub') result = result.filter((d) => Boolean(d.subdomain));
    if (sub === 'rootOnly') result = result.filter((d) => !d.subdomain);
    return result;
  }, [domainsList, searchQuery, filterValues]);

  const filteredSites = useMemo(() => {
    let result = sites;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
      );
    }
    const appLink = filterValues.appLink;
    if (appLink === 'hasApp') {
      const siteIdsWithApps = new Set(apps.map((a) => a.siteId));
      result = result.filter((s) => siteIdsWithApps.has(s.id));
    }
    if (appLink === 'noApp') {
      const siteIdsWithApps = new Set(apps.map((a) => a.siteId));
      result = result.filter((s) => !siteIdsWithApps.has(s.id));
    }
    const mod = filterValues.modules;
    if (mod === 'hasModules') result = result.filter((s) => (s.modules?.length ?? 0) > 0);
    if (mod === 'noModules') result = result.filter((s) => (s.modules?.length ?? 0) === 0);
    return result;
  }, [sites, apps, searchQuery, filterValues]);

  const filteredApps = useMemo(() => {
    let result = apps;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    const plat = filterValues.platform;
    if (plat === 'ios') result = result.filter((a) => formatAppPlatform(a) === 'iOS');
    if (plat === 'android') result = result.filter((a) => formatAppPlatform(a) === 'Android');
    return result;
  }, [apps, searchQuery, filterValues]);

  // ── Tab configs ────────────────────────────────────────────────────────
  const tabConfigs: TabConfig[] = useMemo(
    () => [
      { id: 'apis', label: 'APIs', icon: ServerIcon, count: servicesTotal, isLoading: servicesLoading, actionLabel: 'New API' },
      { id: 'schemas', label: 'Schemas', icon: Database, count: schemasTotal, isLoading: schemasLoading, actionLabel: 'New Schema' },
      { id: 'domains', label: 'Domains', icon: Globe, count: domainsList.length, isLoading: domainsLoading, actionLabel: 'New Domain' },
      { id: 'sites', label: 'Sites', icon: LayoutTemplate, count: sites.length, isLoading: sitesAndAppsLoading, actionLabel: 'New Site' },
      { id: 'apps', label: 'Apps', icon: Smartphone, count: apps.length, isLoading: sitesAndAppsLoading, actionLabel: 'New App' },
    ],
    [schemasTotal, servicesTotal, domainsList.length, sites.length, apps.length, schemasLoading, servicesLoading, domainsLoading, sitesAndAppsLoading],
  );

  const activeConfig = tabConfigs.find((t) => t.id === activeTab);

  // ── Refetch callbacks per tab ──────────────────────────────────────────
  const refetchByTab: Record<ServiceTab, () => void> = useMemo(
    () => ({
      schemas: () => { refetchSchemas(); refetchServices(); },
      apis: () => { refetchDomains(); refetchServices(); refetchSchemas(); },
      domains: () => { refetchDomains(); refetchServices(); },
      sites: () => refetchSitesAndApps(),
      apps: () => refetchSitesAndApps(),
    }),
    [refetchSchemas, refetchServices, refetchDomains, refetchSitesAndApps],
  );

  // ── Create handlers ────────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    const onSuccess = refetchByTab[activeTab];
    switch (activeTab) {
      case 'schemas':
        stack.push({
          id: 'schema-create',
          title: 'Create New Schema',
          Component: SchemaCard,
          props: { databaseId, services, editingSchema: null, onSuccess },
          width: CARD_WIDTHS.wide,
        });
        break;
      case 'apis':
        stack.push({
          id: 'api-create',
          title: 'Create New API',
          Component: ApiCard,
          props: { databaseId, domains: domainsList, schemas, editingApi: null, onSuccess },
          width: CARD_WIDTHS.wide,
        });
        break;
      case 'domains':
        stack.push({
          id: 'domain-create',
          title: 'Create New Domain',
          Component: DomainCard,
          props: { databaseId, services, editingDomain: null, onSuccess },
          width: CARD_WIDTHS.medium,
        });
        break;
      case 'sites':
        stack.push({
          id: 'site-create',
          title: 'Create New Site',
          Component: SiteCard,
          props: { databaseId, editingSite: null, onSuccess },
          width: CARD_WIDTHS.wide,
        });
        break;
      case 'apps':
        stack.push({
          id: 'app-create',
          title: 'Create New App',
          Component: AppCard,
          props: { databaseId, sites, editingApp: null, onSuccess },
          width: CARD_WIDTHS.medium,
        });
        break;
    }
  }, [activeTab, stack, databaseId, services, schemas, domainsList, sites, refetchByTab]);

  // ── Tab switch ─────────────────────────────────────────────────────────
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as ServiceTab);
    setSearchQuery('');
    setFilterValues({});
  }, []);

  const setFilterValue = useCallback((key: string, value: string) => {
    setFilterValues((prev) => {
      if (value === 'all') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const activeFilterCount = Object.keys(filterValues).length;
  const hasActiveSearch = searchQuery.length > 0 || activeFilterCount > 0;

  return (
    <div data-testid="services-route" className='bg-background flex h-full flex-1 flex-col overflow-hidden'>
      <h1 data-testid='services-header' className='sr-only'>
        Services
      </h1>

      {databaseError && (
        <ServicesStateDisplay
          config={{
            type: 'error',
            message: databaseError.message,
            error: databaseError,
            onRetry: refetchDatabases,
          }}
        />
      )}

      {isInitialLoading && !databaseError && (
        <ServicesStateDisplay config={{ type: 'loading', message: 'Loading databases...' }} />
      )}

      {!isInitialLoading && !databaseError && !hasDatabase && (
        <ServicesStateDisplay config={{ type: 'no-database' }} />
      )}

      {!databaseError && !isInitialLoading && hasDatabase && (
        <Tabs
          data-testid='services-list-details'
          value={activeTab}
          onValueChange={handleTabChange}
          className='flex h-full flex-1 flex-col gap-0 overflow-hidden'
        >
          {/* Tab strip */}
          <div className='border-b border-border/40'>
            <div className='px-3'>
              <div className='flex items-center gap-0.5'>
                <TabsList className='bg-transparent p-0 gap-0'>
                  {tabConfigs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          'flex items-center gap-2 rounded-sm px-3 py-2.5 text-xs font-medium transition-colors',
                          'text-muted-foreground hover:text-foreground',
                          'data-[active]:bg-transparent data-[active]:text-foreground data-[active]:shadow-none',
                        )}
                      >
                        <Icon className='h-3.5 w-3.5' />
                        <span>{tab.label}</span>
                        <span
                          className={cn(
                            'ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                            isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {tab.isLoading ? '...' : tab.count}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </div>
          </div>

          {/* Content area */}
          <ScrollArea className='flex-1'>
            <div className='px-3 pt-3 pb-8'>
              {/* Toolbar: search + filter dropdowns + create */}
              <div className='mb-3 flex items-center gap-2.5'>
                {/* Search */}
                <InputGroup className='h-9 w-56 shrink-0 shadow-none'>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={`Search ${activeConfig?.label.toLowerCase() ?? ''}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>

                {/* Separator */}
                <div className='h-5 w-px bg-border/40 shrink-0' />

                {/* Filter dropdowns */}
                {TAB_FILTERS[activeTab]?.map((filter) => {
                  const currentValue = filterValues[filter.key] ?? 'all';
                  const isFiltered = currentValue !== 'all';
                  const selectedOption = filter.options.find((o) => o.value === currentValue);
                  return (
                    <Select
                      key={filter.key}
                      value={currentValue}
                      onValueChange={(val) => setFilterValue(filter.key, val)}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-9 w-auto gap-2 rounded-lg border bg-transparent px-3 text-sm',
                          isFiltered && 'border-primary/50 bg-primary/5 text-primary',
                        )}
                      >
                        <Filter className={cn('h-3.5 w-3.5', isFiltered ? 'text-primary' : 'text-muted-foreground')} />
                        <SelectValue>{selectedOption?.label ?? filter.allLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>{filter.allLabel}</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })}

                {/* Clear all */}
                {hasActiveSearch && (
                  <button
                    type='button'
                    onClick={() => { setSearchQuery(''); setFilterValues({}); }}
                    className={cn(
                      'inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium',
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors',
                    )}
                  >
                    <X className='h-3 w-3' />
                    Clear{activeFilterCount > 0 && ` (${activeFilterCount})`}
                  </button>
                )}

                {/* Create button */}
                {activeConfig && (
                  <Button
                    size='sm'
                    className='ml-auto h-9 gap-1.5 px-3 text-xs'
                    onClick={handleCreate}
                  >
                    <Plus className='h-3.5 w-3.5' />
                    {activeConfig.actionLabel}
                  </Button>
                )}
              </div>

              {/* Tab panels */}
              <TabsContent value='schemas'>
                <SchemasSection
                  schemas={filteredSchemas}
                  totalCount={schemasTotal}
                  services={services}
                  databaseId={databaseId}
                  isLoading={schemasLoading}
                  error={schemasError}
                  onRetry={refetchByTab.schemas}
                  isSectionLoading={sectionLoading}
                  open={true}
                  onOpenChange={() => {}}
                  renderAsPanel
                />
              </TabsContent>

              <TabsContent value='domains'>
                <DomainsSection
                  domains={filteredDomains}
                  services={services}
                  databaseId={databaseId}
                  isLoading={domainsLoading}
                  error={domainsError}
                  onRetry={refetchByTab.domains}
                  isSectionLoading={sectionLoading}
                  open={true}
                  onOpenChange={() => {}}
                  renderAsPanel
                />
              </TabsContent>

              <TabsContent value='apis'>
                <ApisSection
                  services={filteredServices}
                  totalCount={servicesTotal}
                  domains={domainsList}
                  schemas={schemas}
                  databaseId={databaseId}
                  isLoading={servicesLoading}
                  error={servicesError}
                  onRetry={refetchByTab.apis}
                  isSectionLoading={sectionLoading}
                  open={true}
                  onOpenChange={() => {}}
                  renderAsPanel
                />
              </TabsContent>

              <TabsContent value='sites'>
                <SitesSection
                  sites={filteredSites}
                  apps={apps}
                  databaseId={databaseId}
                  isLoading={sitesAndAppsLoading}
                  error={sitesAndAppsError}
                  onRetry={refetchByTab.sites}
                  isSectionLoading={sectionLoading}
                  open={true}
                  onOpenChange={() => {}}
                  renderAsPanel
                />
              </TabsContent>

              <TabsContent value='apps'>
                <AppsSection
                  apps={filteredApps}
                  sites={sites}
                  databaseId={databaseId}
                  isLoading={sitesAndAppsLoading}
                  error={sitesAndAppsError}
                  onRetry={refetchByTab.apps}
                  isSectionLoading={sectionLoading}
                  open={true}
                  onOpenChange={() => {}}
                  renderAsPanel
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      )}
    </div>
  );
}
