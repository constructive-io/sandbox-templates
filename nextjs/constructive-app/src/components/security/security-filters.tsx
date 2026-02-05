import { Circle, Search, Settings2, Shield, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Card, CardContent } from '@constructive-io/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { Label } from '@constructive-io/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@constructive-io/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@constructive-io/ui/select';
import { Switch } from '@constructive-io/ui/switch';

import type { PolicyStatus } from '../policies/policies.types';
import { POLICY_PRIVILEGES, POLICY_ROLES } from '../policies/policies.types';

type SecurityFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  showEmptyTables: boolean;
  onShowEmptyTablesChange: (value: boolean) => void;
  showSystemTables: boolean;
  onShowSystemTablesChange: (value: boolean) => void;
  roleFilter: string | 'all';
  onRoleFilterChange: (value: string | 'all') => void;
  privilegeFilter: string | 'all';
  onPrivilegeFilterChange: (value: string | 'all') => void;
  statusFilter: 'all' | PolicyStatus;
  onStatusFilterChange: (value: 'all' | PolicyStatus) => void;
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
] as const;

export function SecurityFilters({
  search,
  onSearchChange,
  showEmptyTables,
  onShowEmptyTablesChange,
  showSystemTables,
  onShowSystemTablesChange,
  roleFilter,
  onRoleFilterChange,
  privilegeFilter,
  onPrivilegeFilterChange,
  statusFilter,
  onStatusFilterChange,
}: SecurityFiltersProps) {
  return (
    <Card className='shadow-none'>
      <CardContent className='flex flex-col gap-3 p-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <InputGroup className='w-full md:w-auto md:flex-1'>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              placeholder='Search policies...'
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </InputGroup>
          <FilterSelect
            value={roleFilter}
            onChange={onRoleFilterChange}
            options={POLICY_ROLES}
            allLabel='All roles'
            icon={<Users className='h-4 w-4' />}
          />
          <FilterSelect
            value={privilegeFilter}
            onChange={onPrivilegeFilterChange}
            options={POLICY_PRIVILEGES}
            allLabel='All privileges'
            icon={<Shield className='h-4 w-4' />}
          />
          <FilterSelect
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={STATUS_OPTIONS}
            allLabel='All statuses'
            icon={<Circle className='h-4 w-4' />}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='icon' className='h-9 w-9 shrink-0'>
                <Settings2 className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-56 p-3'>
              <div className='space-y-3'>
                <p className='text-muted-foreground text-xs font-medium'>Settings</p>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='show-empty-tables' className='text-foreground/80 cursor-pointer text-sm font-medium'>
                    Show empty tables
                  </Label>
                  <Switch
                    id='show-empty-tables'
                    checked={showEmptyTables}
                    onCheckedChange={(value) => onShowEmptyTablesChange(!!value)}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='show-system-tables' className='text-foreground/80 cursor-pointer text-sm font-medium'>
                    Show system tables
                  </Label>
                  <Switch
                    id='show-system-tables'
                    checked={showSystemTables}
                    onCheckedChange={(value) => onShowSystemTablesChange(!!value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}

type FilterSelectProps<T extends string> = {
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  options: ReadonlyArray<{ readonly value: T; readonly label: string }>;
  allLabel: string;
  icon?: React.ReactNode;
};

function FilterSelect<T extends string>({ value, onChange, options, allLabel, icon }: FilterSelectProps<T>) {
  const isFiltered = value !== 'all';
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Select value={value} onValueChange={(val) => onChange(val as T | 'all')}>
      <SelectTrigger
        className={cn(
          'h-9 w-auto gap-2 rounded-lg border bg-transparent px-3',
          isFiltered && 'border-primary/50 bg-primary/5 text-primary',
        )}
      >
        {icon && <span className={cn('text-muted-foreground', isFiltered && 'text-primary')}>{icon}</span>}
        <SelectValue>{selectedOption?.label ?? allLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
