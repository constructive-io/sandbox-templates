import { cn } from '@/lib/utils';

interface RailsProps {
	isAny: boolean;
}

export function Rails({ isAny }: RailsProps) {
	return (
		<div className='flex justify-center pr-4'>
			<div className={cn('h-full w-[2px] rounded-full opacity-60', isAny ? 'bg-amber-400' : 'bg-primary/70')} />
		</div>
	);
}
