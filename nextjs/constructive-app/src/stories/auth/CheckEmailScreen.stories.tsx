import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CheckEmailScreen } from '@/components/auth';

const meta: Meta<typeof CheckEmailScreen> = {
	title: 'Auth/CheckEmailScreen',
	component: CheckEmailScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		type: 'verification',
		email: 'user@example.com',
		onSendVerificationEmail: async () => {},
		isSending: false,
		sendSuccess: false,
		error: null,
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Resent: Story = {
	args: {
		sendSuccess: true,
	},
};

export const Error: Story = {
	args: {
		error: 'Failed to send verification email. Please try again.',
	},
};
