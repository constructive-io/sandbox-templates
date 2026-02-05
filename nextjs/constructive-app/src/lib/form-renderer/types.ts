import type { UIAction, UINode, UISchema } from '@/lib/form-builder';

export type FormRendererMode = 'preview' | 'edit';

export interface FormRendererProps {
	schema: UISchema;
	initialValues?: Record<string, unknown>;
	onSubmit?: (values: Record<string, unknown>) => void;
	onChange?: (values: Record<string, unknown>) => void;
	onAction?: (action: UIAction, event: string) => void;
	mode?: FormRendererMode;
	className?: string;
}

export interface FormRendererContextValue {
	values: Record<string, unknown>;
	errors: Record<string, string>;
	setValue: (name: string, value: unknown) => void;
	setError: (name: string, error: string | null) => void;
	mode: FormRendererMode;
	schema: UISchema;
	onAction?: (action: UIAction, event: string) => void;
}

export interface NodeProps {
	node: UINode;
}

export interface NodeWithChildrenProps extends NodeProps {
	children?: React.ReactNode;
}
