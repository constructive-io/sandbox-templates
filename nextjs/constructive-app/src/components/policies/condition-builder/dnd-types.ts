import { DropPosition } from './tree-utils';

export type DragItemType = 'condition' | 'group';

export interface DragItem {
	id: string;
	type: DragItemType;
}

export interface DropTargetMeta {
	targetId: string;
	position: DropPosition;
}
