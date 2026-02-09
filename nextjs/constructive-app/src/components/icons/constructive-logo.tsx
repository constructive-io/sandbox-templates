'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

interface ConstructiveLogoProps {
	className?: string;
}

export function ConstructiveLogo({ className }: ConstructiveLogoProps) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration mismatch - show nothing until mounted
	if (!mounted) {
		return <div className={cn('h-5 w-auto', className)} />;
	}

	const isDark = resolvedTheme === 'dark';
	const src = isDark ? '/constructive-full.svg' : '/constructive-full-black.svg';

	return (
		<Image
			src={src}
			alt='Constructive'
			width={0}
			height={0}
			className={cn('h-auto w-auto', className)}
			unoptimized
			priority
		/>
	);
}
