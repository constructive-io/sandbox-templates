import { useId } from 'react';
import { RiSearch2Line } from '@remixicon/react';

import { SidebarGroup, SidebarGroupContent, SidebarInput } from '@constructive-io/ui/sidebar';

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
	const id = useId();

	return (
		<form {...props}>
			<SidebarGroup className='py-0'>
				<SidebarGroupContent className='relative'>
					<div className='relative'>
						<SidebarInput id={id} className='ps-9 pe-9' aria-label='Search' />
						<div
							className='text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center
								justify-center ps-2 peer-disabled:opacity-50'
						>
							<RiSearch2Line size={20} aria-hidden='true' />
						</div>
						<div
							className='text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center
								justify-center pe-2'
						>
							<kbd
								className='bg-input text-muted-foreground/70 inline-flex size-5 max-h-full items-center justify-center
									rounded px-1 font-[inherit] text-[0.625rem] font-medium'
							>
								/
							</kbd>
						</div>
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		</form>
	);
}
