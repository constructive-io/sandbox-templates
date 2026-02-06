import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { LoginScreen } from '@/components/auth';

const meta: Meta<typeof LoginScreen> = {
	title: 'Auth/LoginScreen',
	component: LoginScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		onLogin: async () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
