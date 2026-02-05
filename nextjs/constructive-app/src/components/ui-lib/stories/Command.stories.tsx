import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	CalendarIcon,
	CreditCardIcon,
	SettingsIcon,
	UserIcon,
	MailIcon,
	FileIcon,
	CalculatorIcon,
	SmileIcon,
} from 'lucide-react';

import {
	Command,
	CommandDialog,
	CommandDialogTrigger,
	CommandDialogPopup,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandGroupLabel,
	CommandItem,
	CommandSeparator,
	CommandShortcut,
	CommandFooter,
	CommandPanel,
	CommandCollection,
} from '../components/command';
import { Button } from '../components/button';
import React from 'react';

const meta: Meta<typeof Command> = {
	title: 'UI/Command',
	component: Command,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

type CommandItemType = {
	value: string;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	shortcut?: string;
};

type CommandGroupType = {
	value: string;
	items: CommandItemType[];
};

const suggestions: CommandItemType[] = [
	{ value: 'calendar', label: 'Calendar', icon: CalendarIcon },
	{ value: 'search-emoji', label: 'Search Emoji', icon: SmileIcon },
	{ value: 'calculator', label: 'Calculator', icon: CalculatorIcon },
];

const settings: CommandItemType[] = [
	{ value: 'profile', label: 'Profile', icon: UserIcon, shortcut: '⌘P' },
	{ value: 'billing', label: 'Billing', icon: CreditCardIcon, shortcut: '⌘B' },
	{ value: 'settings', label: 'Settings', icon: SettingsIcon, shortcut: '⌘S' },
];

const groupedItems: CommandGroupType[] = [
	{ value: 'Suggestions', items: suggestions },
	{ value: 'Settings', items: settings },
];

export const Default: Story = {
	render: () => (
		<Command items={groupedItems} className='w-[350px] rounded-lg border shadow-md'>
			<CommandInput placeholder='Type a command or search...' />
			<CommandList>
				{(group: CommandGroupType, index: number) => (
					<React.Fragment key={group.value}>
						<CommandGroup items={group.items}>
							<CommandGroupLabel>{group.value}</CommandGroupLabel>
							<CommandCollection>
								{(item: CommandItemType) => (
									<CommandItem key={item.value} value={item.value}>
										{item.icon && <item.icon className='mr-2 h-4 w-4' />}
										<span>{item.label}</span>
										{item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
									</CommandItem>
								)}
							</CommandCollection>
						</CommandGroup>
						{index < groupedItems.length - 1 && <CommandSeparator />}
					</React.Fragment>
				)}
			</CommandList>
			<CommandEmpty>No results found.</CommandEmpty>
		</Command>
	),
};

export const InDialog: Story = {
	render: function DialogExample() {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button variant='outline' onClick={() => setOpen(true)}>
					Open Command Palette
					<kbd className='ml-2 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs'>⌘K</kbd>
				</Button>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandDialogPopup>
						<Command items={groupedItems}>
							<CommandInput placeholder='Type a command or search...' />
							<CommandPanel>
								<CommandList>
									{(group: CommandGroupType, index: number) => (
										<React.Fragment key={group.value}>
											<CommandGroup items={group.items}>
												<CommandGroupLabel>{group.value}</CommandGroupLabel>
												<CommandCollection>
													{(item: CommandItemType) => (
														<CommandItem key={item.value} value={item.value}>
															{item.icon && <item.icon className='mr-2 h-4 w-4' />}
															<span>{item.label}</span>
															{item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
														</CommandItem>
													)}
												</CommandCollection>
											</CommandGroup>
											{index < groupedItems.length - 1 && <CommandSeparator />}
										</React.Fragment>
									)}
								</CommandList>
								<CommandEmpty>No results found.</CommandEmpty>
							</CommandPanel>
							<CommandFooter>
								<span>Press ↵ to select</span>
								<span>ESC to close</span>
							</CommandFooter>
						</Command>
					</CommandDialogPopup>
				</CommandDialog>
			</>
		);
	},
};

const quickActions: CommandItemType[] = [
	{ value: 'new-file', label: 'New File', icon: FileIcon, shortcut: '⌘N' },
	{ value: 'new-mail', label: 'New Email', icon: MailIcon, shortcut: '⌘M' },
];

const quickActionsGroup: CommandGroupType[] = [{ value: 'Quick Actions', items: quickActions }];

export const WithTrigger: Story = {
	render: () => (
		<CommandDialog>
			<CommandDialogTrigger asChild>
				<Button variant='outline' className='w-[280px] justify-start text-muted-foreground'>
					<span>Search...</span>
					<kbd className='ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-xs'>⌘K</kbd>
				</Button>
			</CommandDialogTrigger>
			<CommandDialogPopup>
				<Command items={quickActionsGroup}>
					<CommandInput placeholder='Type a command or search...' />
					<CommandPanel>
						<CommandList>
							{(group: CommandGroupType) => (
								<CommandGroup key={group.value} items={group.items}>
									<CommandGroupLabel>{group.value}</CommandGroupLabel>
									<CommandCollection>
										{(item: CommandItemType) => (
											<CommandItem key={item.value} value={item.value}>
												{item.icon && <item.icon className='mr-2 h-4 w-4' />}
												<span>{item.label}</span>
												{item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
											</CommandItem>
										)}
									</CommandCollection>
								</CommandGroup>
							)}
						</CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
					</CommandPanel>
				</Command>
			</CommandDialogPopup>
		</CommandDialog>
	),
};

const allItems: CommandGroupType[] = [
	{
		value: 'Pages',
		items: [
			{ value: 'home', label: 'Home' },
			{ value: 'dashboard', label: 'Dashboard' },
			{ value: 'projects', label: 'Projects' },
			{ value: 'tasks', label: 'Tasks' },
			{ value: 'reports', label: 'Reports' },
		],
	},
	{
		value: 'Actions',
		items: [
			{ value: 'create-project', label: 'Create Project' },
			{ value: 'invite-member', label: 'Invite Team Member' },
			{ value: 'export-data', label: 'Export Data' },
		],
	},
	{
		value: 'Settings',
		items: [
			{ value: 'account', label: 'Account Settings' },
			{ value: 'notifications', label: 'Notifications' },
			{ value: 'security', label: 'Security' },
			{ value: 'integrations', label: 'Integrations' },
		],
	},
];

export const GroupedCommands: Story = {
	render: () => (
		<Command items={allItems} className='w-[400px] rounded-lg border shadow-md'>
			<CommandInput placeholder='Search pages, actions, settings...' />
			<CommandList>
				{(group: CommandGroupType, index: number) => (
					<React.Fragment key={group.value}>
						<CommandGroup items={group.items}>
							<CommandGroupLabel>{group.value}</CommandGroupLabel>
							<CommandCollection>
								{(item: CommandItemType) => (
									<CommandItem key={item.value} value={item.value}>
										{item.label}
									</CommandItem>
								)}
							</CommandCollection>
						</CommandGroup>
						{index < allItems.length - 1 && <CommandSeparator />}
					</React.Fragment>
				)}
			</CommandList>
			<CommandEmpty>No results found.</CommandEmpty>
		</Command>
	),
};

const simpleItems: CommandItemType[] = [
	{ value: 'linear', label: 'Linear' },
	{ value: 'figma', label: 'Figma' },
	{ value: 'notion', label: 'Notion' },
	{ value: 'slack', label: 'Slack' },
];

const simpleGroup: CommandGroupType[] = [{ value: 'Results', items: simpleItems }];

export const WithFooter: Story = {
	render: () => (
		<Command items={simpleGroup} className='w-[400px] rounded-lg border shadow-md'>
			<CommandInput placeholder='Type a command or search...' />
			<CommandList>
				{(group: CommandGroupType) => (
					<CommandGroup key={group.value} items={group.items}>
						<CommandGroupLabel>{group.value}</CommandGroupLabel>
						<CommandCollection>
							{(item: CommandItemType) => (
								<CommandItem key={item.value} value={item.value}>
									{item.label}
								</CommandItem>
							)}
						</CommandCollection>
					</CommandGroup>
				)}
			</CommandList>
			<CommandEmpty>No results found.</CommandEmpty>
			<CommandFooter>
				<div className='flex items-center gap-4'>
					<span className='flex items-center gap-1'>
						<kbd className='rounded border bg-muted px-1'>↑</kbd>
						<kbd className='rounded border bg-muted px-1'>↓</kbd>
						Navigate
					</span>
					<span className='flex items-center gap-1'>
						<kbd className='rounded border bg-muted px-1'>↵</kbd>
						Select
					</span>
					<span className='flex items-center gap-1'>
						<kbd className='rounded border bg-muted px-1'>esc</kbd>
						Close
					</span>
				</div>
			</CommandFooter>
		</Command>
	),
};

export const Empty: Story = {
	render: () => (
		<Command items={[]} className='w-[350px] rounded-lg border shadow-md'>
			<CommandInput placeholder='Search for something...' />
			<CommandList>{() => null}</CommandList>
			<CommandEmpty>
				<div className='flex flex-col items-center gap-2 py-4'>
					<SmileIcon className='h-8 w-8 text-muted-foreground' />
					<p className='text-sm'>No results found</p>
					<p className='text-muted-foreground text-xs'>Try a different search term</p>
				</div>
			</CommandEmpty>
		</Command>
	),
};

const frameworks = [
	'Next.js',
	'React',
	'Vue',
	'Nuxt',
	'Svelte',
	'SvelteKit',
	'Angular',
	'Remix',
	'Astro',
	'Solid',
	'Qwik',
	'Gatsby',
].map((f) => ({ value: f.toLowerCase().replace('.', ''), label: f }));

const frameworksGroup: CommandGroupType[] = [{ value: 'Frameworks', items: frameworks }];

export const SearchableList: Story = {
	render: () => (
		<Command items={frameworksGroup} className='w-[300px] rounded-lg border shadow-md'>
			<CommandInput placeholder='Search frameworks...' />
			<CommandList>
				{(group: CommandGroupType) => (
					<CommandGroup key={group.value} items={group.items}>
						<CommandGroupLabel>{group.value}</CommandGroupLabel>
						<CommandCollection>
							{(item: CommandItemType) => (
								<CommandItem key={item.value} value={item.value}>
									{item.label}
								</CommandItem>
							)}
						</CommandCollection>
					</CommandGroup>
				)}
			</CommandList>
			<CommandEmpty>No framework found.</CommandEmpty>
		</Command>
	),
};
