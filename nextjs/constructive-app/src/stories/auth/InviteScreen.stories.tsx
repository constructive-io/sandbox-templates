import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InviteScreen } from '@/components/auth';

const meta: Meta<typeof InviteScreen> = {
	title: 'Auth/InviteScreen',
	component: InviteScreen,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
	args: {
		onAccept: () => {},
		onCancel: () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
	args: {
		state: { status: 'loading' },
	},
};

export const MissingToken: Story = {
	args: {
		state: { status: 'no-token' },
	},
};

export const NeedsAuth: Story = {
	args: {
		state: { status: 'needs-auth' },
	},
};

export const Ready: Story = {
	args: {
		state: { status: 'ready' },
	},
};

export const Submitting: Story = {
	args: {
		state: { status: 'submitting' },
	},
};

export const Success: Story = {
	args: {
		state: { status: 'success' },
	},
};

export const Error: Story = {
	args: {
		state: { status: 'error', message: 'This invite is invalid or has expired.' },
	},
};
