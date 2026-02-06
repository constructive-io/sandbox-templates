import type { ReactNode } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@constructive-io/ui/table';

interface ServiceTableColumn {
  label?: ReactNode;
  className?: string;
}

interface ServiceTableViewProps {
  columns: ServiceTableColumn[];
  children: ReactNode;
}

export function ServiceTableView({ columns, children }: ServiceTableViewProps) {
  return (
    <div className='border-border/60 bg-card mt-3 overflow-hidden rounded-lg border'>
      <div className='relative w-full overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/40 text-muted-foreground'>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </div>
  );
}

export { TableCell, TableRow };

export type { ServiceTableColumn, ServiceTableViewProps };
