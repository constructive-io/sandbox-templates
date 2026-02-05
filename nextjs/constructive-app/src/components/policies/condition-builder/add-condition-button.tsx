interface AddConditionButtonProps {
	onClick: () => void;
}

export function AddConditionButton({ onClick }: AddConditionButtonProps) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='text-primary hover:text-primary/80 mt-2 cursor-pointer text-xs font-medium'
		>
			+ Add condition
		</button>
	);
}
