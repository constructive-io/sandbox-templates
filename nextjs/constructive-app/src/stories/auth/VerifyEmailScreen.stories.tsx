import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { VerifyEmailScreen } from '@/components/auth';

const meta: Meta<typeof VerifyEmailScreen> = {
	title: 'Auth/VerifyEmailScreen',
	component: VerifyEmailScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
	args: {
		status: 'loading',
	},
};

export const Success: Story = {
	args: {
		status: 'success',
	},
};

export const Error: Story = {
	args: {
		status: 'error',
		errorMessage: 'Failed to verify email. The link may have expired or is invalid.',
	},
};

export const Invalid: Story = {
	args: {
		status: 'invalid',
	},
};
