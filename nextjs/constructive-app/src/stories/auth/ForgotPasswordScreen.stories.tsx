import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ForgotPasswordScreen } from '@/components/auth';

const meta: Meta<typeof ForgotPasswordScreen> = {
	title: 'Auth/ForgotPasswordScreen',
	component: ForgotPasswordScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		onForgotPassword: async () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
