import { cn } from '@/lib/utils';
import { Badge } from '@constructive-io/ui/badge';

export interface DataTypeBadgeProps {
	className?: string;
	children?: React.ReactNode;
}
export function DataTypeBadge(props: DataTypeBadgeProps) {
	return (
		<Badge
			variant='secondary'
			className={cn(
				`bg-muted dark:bg-sidebar-border text-muted-foreground rounded-md border-0 px-1.5 py-0.5 font-mono text-xs
				font-medium`,
				props.className,
			)}
		>
			{props.children}
		</Badge>
	);
}
