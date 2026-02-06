import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ResetPasswordScreen } from '@/components/auth';

const meta: Meta<typeof ResetPasswordScreen> = {
	title: 'Auth/ResetPasswordScreen',
	component: ResetPasswordScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		resetToken: 'reset-token',
		onResetPassword: async () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToken: Story = {};

export const MissingToken: Story = {
	args: {
		resetToken: '',
	},
};
