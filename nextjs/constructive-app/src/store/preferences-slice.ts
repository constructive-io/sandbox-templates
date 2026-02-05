import { StateCreator } from 'zustand';

/**
 * Sidebar sections expand state - tracks which table groups are expanded/collapsed
 */
export interface SidebarSectionsExpanded {
	app: boolean;
	system: boolean;
}

/** Default: APP section expanded, System section collapsed */
const DEFAULT_SIDEBAR_SECTIONS: SidebarSectionsExpanded = {
	app: true,
	system: false,
};

/**
 * PreferencesSlice - App-level UI preferences that persist across sessions
 *
 * These are non-auth-sensitive settings that enhance UX by remembering
 * user choices. They apply regardless of which admin account is logged in.
 */
export interface PreferencesSlice {
	// Sidebar section expand/collapse state (Your Tables / System Tables)
	sidebarSectionsExpanded: SidebarSectionsExpanded;
	setSidebarSectionExpanded: (section: 'app' | 'system', expanded: boolean) => void;
	toggleSidebarSection: (section: 'app' | 'system') => void;
	resetSidebarSections: () => void;

	// Schema visualizer: show CORE/MODULE tables (default: false, only show APP tables)
	showSystemTablesInVisualizer: boolean;
	setShowSystemTablesInVisualizer: (show: boolean) => void;
	toggleShowSystemTablesInVisualizer: () => void;

	// Main sidebar pinned/expanded state (default: false/collapsed)
	sidebarPinned: boolean;
	setSidebarPinned: (pinned: boolean) => void;
	toggleSidebarPinned: () => void;
}

export const createPreferencesSlice: StateCreator<PreferencesSlice, [], [], PreferencesSlice> = (set) => ({
	sidebarSectionsExpanded: DEFAULT_SIDEBAR_SECTIONS,
	setSidebarSectionExpanded: (section, expanded) =>
		set((state) => ({
			sidebarSectionsExpanded: {
				...state.sidebarSectionsExpanded,
				[section]: expanded,
			},
		})),
	toggleSidebarSection: (section) =>
		set((state) => ({
			sidebarSectionsExpanded: {
				...state.sidebarSectionsExpanded,
				[section]: !state.sidebarSectionsExpanded[section],
			},
		})),
	resetSidebarSections: () => set({ sidebarSectionsExpanded: DEFAULT_SIDEBAR_SECTIONS }),

	// Visualizer filter: default to hiding system tables
	showSystemTablesInVisualizer: false,
	setShowSystemTablesInVisualizer: (show) => set({ showSystemTablesInVisualizer: show }),
	toggleShowSystemTablesInVisualizer: () =>
		set((state) => ({ showSystemTablesInVisualizer: !state.showSystemTablesInVisualizer })),

	// Main sidebar pinned state: default to collapsed
	sidebarPinned: false,
	setSidebarPinned: (pinned) => set({ sidebarPinned: pinned }),
	toggleSidebarPinned: () => set((state) => ({ sidebarPinned: !state.sidebarPinned })),
});

/* ==== Serialization and deserialization ==== */
export const serializePreferencesSlice = (state: PreferencesSlice) => ({
	preferences: {
		sidebarSectionsExpanded: state.sidebarSectionsExpanded,
		showSystemTablesInVisualizer: state.showSystemTablesInVisualizer,
		sidebarPinned: state.sidebarPinned,
	},
});

export const deserializePreferencesSlice = (persisted: any): Partial<PreferencesSlice> => {
	const prefs = persisted?.preferences;
	if (!prefs) {
		return {
			sidebarSectionsExpanded: DEFAULT_SIDEBAR_SECTIONS,
			showSystemTablesInVisualizer: false,
			sidebarPinned: false,
		};
	}
	return {
		sidebarSectionsExpanded: prefs.sidebarSectionsExpanded ?? DEFAULT_SIDEBAR_SECTIONS,
		showSystemTablesInVisualizer: prefs.showSystemTablesInVisualizer ?? false,
		sidebarPinned: prefs.sidebarPinned ?? false,
	};
};
