'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UINode, UISchema, UINodeConstraints } from '@/lib/form-builder';
import { isInputNode } from '@/lib/form-builder';

import { FormRendererProvider } from './context';
import { nodeRegistry, UnknownNode } from './registry';
import type { FormRendererProps, FormRendererContextValue } from './types';
import { validateField } from './validation';

export function NodeRenderer({ node }: { node: UINode }) {
	const Component = nodeRegistry[node.type];

	if (!Component) {
		return <UnknownNode type={node.type} />;
	}

	const children =
		node.children && node.children.length > 0
			? node.children.map((child) => <NodeRenderer key={child.key} node={child} />)
			: undefined;

	return <Component node={node}>{children}</Component>;
}

function collectFieldNames(node: UINode): string[] {
	const names: string[] = [];

	if (isInputNode(node) && node.props?.name) {
		names.push(node.props.name as string);
	}

	for (const child of node.children ?? []) {
		names.push(...collectFieldNames(child));
	}

	return names;
}

function collectInitialValues(node: UINode): Record<string, unknown> {
	const values: Record<string, unknown> = {};

	if (isInputNode(node) && node.props?.name) {
		const name = node.props.name as string;
		if (node.props.defaultValue !== undefined) {
			values[name] = node.props.defaultValue;
		}
	}

	for (const child of node.children ?? []) {
		Object.assign(values, collectInitialValues(child));
	}

	return values;
}

function collectFieldConstraints(node: UINode): Record<string, { constraints?: UINodeConstraints; required?: boolean }> {
	const result: Record<string, { constraints?: UINodeConstraints; required?: boolean }> = {};

	if (isInputNode(node) && node.props?.name) {
		const name = node.props.name as string;
		result[name] = {
			constraints: node.props.constraints as UINodeConstraints | undefined,
			required: node.props.required as boolean | undefined,
		};
	}

	for (const child of node.children ?? []) {
		Object.assign(result, collectFieldConstraints(child));
	}

	return result;
}

export function FieldNodePreview({ node, className }: { node: UINode; className?: string }) {
	const [values, setValues] = useState<Record<string, unknown>>(() => collectInitialValues(node));
	const [errors, setErrors] = useState<Record<string, string>>({});

	const setValue = useCallback((name: string, value: unknown) => {
		setValues((prev) => ({ ...prev, [name]: value }));
	}, []);

	const setError = useCallback((name: string, error: string | null) => {
		setErrors((prev) => {
			if (error) {
				return { ...prev, [name]: error };
			}
			const { [name]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const minimalSchema: UISchema = useMemo(
		() => ({
			formatVersion: '1.0',
			type: 'UISchema',
			id: 'field-preview',
			page: { key: 'preview-root', type: 'Form', props: {}, children: [node] },
		}),
		[node],
	);

	const contextValue: FormRendererContextValue = useMemo(
		() => ({
			values,
			errors,
			setValue,
			setError,
			mode: 'edit' as const,
			schema: minimalSchema,
		}),
		[values, errors, setValue, setError, minimalSchema],
	);

	return (
		<FormRendererProvider value={contextValue}>
			<div className={className}>
				<NodeRenderer node={node} />
			</div>
		</FormRendererProvider>
	);
}

export function FormRenderer({
	schema,
	initialValues,
	onSubmit,
	onChange,
	onAction,
	mode = 'preview',
	className,
}: FormRendererProps) {
	const schemaDefaults = useMemo(() => collectInitialValues(schema.page), [schema]);
	const fieldConstraints = useMemo(() => collectFieldConstraints(schema.page), [schema]);

	const [values, setValues] = useState<Record<string, unknown>>(() => ({
		...schemaDefaults,
		...initialValues,
	}));
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		setValues((prev) => ({
			...schemaDefaults,
			...initialValues,
			...prev,
		}));
	}, [schemaDefaults, initialValues]);

	const setValue = useCallback(
		(name: string, value: unknown) => {
			setValues((prev) => {
				const next = { ...prev, [name]: value };
				onChange?.(next);
				return next;
			});

			const fieldConfig = fieldConstraints[name];
			if (fieldConfig) {
				const error = validateField(value, fieldConfig.constraints, fieldConfig.required);
				setErrors((prev) => {
					if (error) {
						return { ...prev, [name]: error };
					}
					const { [name]: _, ...rest } = prev;
					return rest;
				});
			}
		},
		[onChange, fieldConstraints],
	);

	const setError = useCallback((name: string, error: string | null) => {
		setErrors((prev) => {
			if (error) {
				return { ...prev, [name]: error };
			}
			const { [name]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const handleAction = useCallback(
		(action: Parameters<NonNullable<typeof onAction>>[0], event: string) => {
			if (event === 'submit' && onSubmit) {
				const fieldNames = collectFieldNames(schema.page);
				const newErrors: Record<string, string> = {};

				for (const name of fieldNames) {
					const fieldConfig = fieldConstraints[name];
					if (fieldConfig) {
						const error = validateField(values[name], fieldConfig.constraints, fieldConfig.required);
						if (error) {
							newErrors[name] = error;
						}
					}
				}

				if (Object.keys(newErrors).length > 0) {
					setErrors(newErrors);
					return;
				}

				onSubmit(values);
			}

			onAction?.(action, event);
		},
		[onSubmit, onAction, values, schema.page, fieldConstraints],
	);

	const contextValue: FormRendererContextValue = useMemo(
		() => ({
			values,
			errors,
			setValue,
			setError,
			mode,
			schema,
			onAction: handleAction,
		}),
		[values, errors, setValue, setError, mode, schema, handleAction],
	);

	return (
		<FormRendererProvider value={contextValue}>
			<div className={className}>
				<NodeRenderer node={schema.page} />
			</div>
		</FormRendererProvider>
	);
}
