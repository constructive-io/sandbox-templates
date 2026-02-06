'use client';

import type { RelationshipType } from '@/lib/schema';

export function OneToOneConnector({ color }: { color: string }) {
	return (
		<svg width='80' height='60' viewBox='0 0 80 60' fill='none'>
			<line x1='10' y1='30' x2='70' y2='30' stroke={color} strokeWidth='3' />
			<path
				d='M 65 25 L 70 30 L 65 35'
				stroke={color}
				strokeWidth='2.5'
				fill='none'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M 15 25 L 10 30 L 15 35'
				stroke={color}
				strokeWidth='2.5'
				fill='none'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<circle cx='20' cy='30' r='2.5' fill={color}>
				<animate attributeName='cx' values='20;60;20' dur='2s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;0' dur='2s' repeatCount='indefinite' />
			</circle>
			<circle cx='60' cy='30' r='2.5' fill={color}>
				<animate attributeName='cx' values='60;20;60' dur='2s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;0' dur='2s' repeatCount='indefinite' />
			</circle>
		</svg>
	);
}

export function OneToManyConnector({ color }: { color: string }) {
	return (
		<svg width='90' height='70' viewBox='0 0 90 70' fill='none'>
			<line x1='5' y1='35' x2='55' y2='35' stroke={color} strokeWidth='3' />
			<path
				d='M 50 30 L 58 35 L 50 40'
				stroke={color}
				strokeWidth='2.5'
				fill={color}
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<animate attributeName='opacity' values='0.5;1;0.5' dur='1.5s' repeatCount='indefinite' />
			</path>
			<line x1='60' y1='35' x2='78' y2='17' stroke={color} strokeWidth='2.5' />
			<circle cx='78' cy='17' r='3' fill={color} />
			<line x1='60' y1='35' x2='80' y2='35' stroke={color} strokeWidth='2.5' />
			<circle cx='80' cy='35' r='3' fill={color} />
			<line x1='60' y1='35' x2='78' y2='53' stroke={color} strokeWidth='2.5' />
			<circle cx='78' cy='53' r='3' fill={color} />
			<circle cx='60' cy='35' r='2' fill={color}>
				<animate attributeName='cx' values='60;78' dur='1.5s' repeatCount='indefinite' />
				<animate attributeName='cy' values='35;17' dur='1.5s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;0' dur='1.5s' repeatCount='indefinite' />
			</circle>
			<circle cx='60' cy='35' r='2' fill={color}>
				<animate attributeName='cx' values='60;80' dur='1.5s' repeatCount='indefinite' begin='0.3s' />
				<animate attributeName='opacity' values='0;1;0' dur='1.5s' repeatCount='indefinite' begin='0.3s' />
			</circle>
			<circle cx='60' cy='35' r='2' fill={color}>
				<animate attributeName='cx' values='60;78' dur='1.5s' repeatCount='indefinite' begin='0.6s' />
				<animate attributeName='cy' values='35;53' dur='1.5s' repeatCount='indefinite' begin='0.6s' />
				<animate attributeName='opacity' values='0;1;0' dur='1.5s' repeatCount='indefinite' begin='0.6s' />
			</circle>
			<circle cx='20' cy='35' r='3' fill={color}>
				<animate attributeName='cx' values='20;45;20' dur='2s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;0' dur='2s' repeatCount='indefinite' />
			</circle>
		</svg>
	);
}

export function ManyToManyConnector({ color }: { color: string }) {
	return (
		<svg width='100' height='90' viewBox='0 0 100 90' fill='none'>
			<line x1='25' y1='45' x2='7' y2='27' stroke={color} strokeWidth='2.5' />
			<circle cx='7' cy='27' r='3' fill={color} />
			<line x1='25' y1='45' x2='5' y2='45' stroke={color} strokeWidth='2.5' />
			<circle cx='5' cy='45' r='3' fill={color} />
			<line x1='25' y1='45' x2='7' y2='63' stroke={color} strokeWidth='2.5' />
			<circle cx='7' cy='63' r='3' fill={color} />
			<path d='M 25 40 Q 50 22 75 40' stroke={color} strokeWidth='2.5' fill='none' />
			<path d='M 70 37 L 75 40 L 72 44' stroke={color} strokeWidth='2' fill={color} />
			<path d='M 75 50 Q 50 68 25 50' stroke={color} strokeWidth='2.5' fill='none' />
			<path d='M 28 46 L 25 50 L 30 53' stroke={color} strokeWidth='2' fill={color} />
			<line x1='75' y1='45' x2='93' y2='27' stroke={color} strokeWidth='2.5' />
			<circle cx='93' cy='27' r='3' fill={color} />
			<line x1='75' y1='45' x2='95' y2='45' stroke={color} strokeWidth='2.5' />
			<circle cx='95' cy='45' r='3' fill={color} />
			<line x1='75' y1='45' x2='93' y2='63' stroke={color} strokeWidth='2.5' />
			<circle cx='93' cy='63' r='3' fill={color} />
			<rect x='42' y='39' width='16' height='12' rx='2' fill={color} opacity='0.3' />
			<circle cx='40' cy='38' r='2.5' fill={color}>
				<animate attributeName='cx' values='30;70' dur='2s' repeatCount='indefinite' />
				<animate attributeName='cy' values='32;32' dur='2s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;1;0' dur='2s' repeatCount='indefinite' />
			</circle>
			<circle cx='60' cy='58' r='2.5' fill={color}>
				<animate attributeName='cx' values='70;30' dur='2s' repeatCount='indefinite' />
				<animate attributeName='cy' values='58;58' dur='2s' repeatCount='indefinite' />
				<animate attributeName='opacity' values='0;1;1;0' dur='2s' repeatCount='indefinite' />
			</circle>
		</svg>
	);
}

export function RelationshipConnector({ type, color }: { type: RelationshipType; color: string }) {
	switch (type) {
		case 'one-to-one':
			return <OneToOneConnector color={color} />;
		case 'one-to-many':
			return <OneToManyConnector color={color} />;
		case 'many-to-many':
			return <ManyToManyConnector color={color} />;
		default:
			return <OneToManyConnector color={color} />;
	}
}
