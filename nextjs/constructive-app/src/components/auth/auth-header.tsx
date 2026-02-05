import { cn } from '@/lib/utils';
import { CardDescription, CardTitle } from '@constructive-io/ui/card';
import { ConstructiveIcon } from '@/components/icons/constructive-icon';

interface AuthHeaderProps {
	title: string;
	description?: string;
	showLogo?: boolean;
	className?: string;
}

export function AuthHeader({ title, description, showLogo = true, className }: AuthHeaderProps) {
	return (
		<div className={cn('flex flex-col items-center space-y-2', className)}>
			{showLogo && (
				<div className='flex items-center space-x-2'>
					<div className='flex h-8 w-8 items-center justify-center rounded-md'>
						<ConstructiveIcon className='text-primary' />
					</div>
					<span className='text-lg font-semibold'>Constructive</span>
				</div>
			)}
			<div className='text-center'>
				<CardTitle className='text-2xl font-bold'>{title}</CardTitle>
				{description && <CardDescription className='text-muted-foreground mt-2'>{description}</CardDescription>}
			</div>
		</div>
	);
}
