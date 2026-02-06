import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RegisterScreen } from '@/components/auth';

const meta: Meta<typeof RegisterScreen> = {
	title: 'Auth/RegisterScreen',
	component: RegisterScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		onRegister: async () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
