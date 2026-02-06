import { SidebarInset } from '@constructive-io/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';

export interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout(props: SidebarLayoutProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset
        className='flex h-full flex-1 flex-col overflow-hidden px-4 md:px-6 lg:px-8'
        style={{ contain: 'content' }}
      >
        {props.children}
      </SidebarInset>
    </>
  );
}
