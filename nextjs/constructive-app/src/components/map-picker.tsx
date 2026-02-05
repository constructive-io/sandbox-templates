'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LeafletMouseEvent } from 'leaflet';
import { MapPinIcon, SearchIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Card, CardContent } from '@constructive-io/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });

// Custom marker component
const CustomMarker = dynamic(
	() =>
		import('leaflet').then((L) => {
			return import('react-leaflet').then((mod) => {
				const { Marker } = mod;

				// Create custom icon using DivIcon
				const createCustomIcon = (color: string = '#3b82f6') => {
					return L.divIcon({
						html: `
              <div style="
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${color};
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                  style="transform: rotate(45deg);"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            `,
						className: 'custom-marker',
						iconSize: [32, 32],
						iconAnchor: [16, 32],
						popupAnchor: [0, -32],
					});
				};

				return function CustomMarkerComponent({
					position,
					color = '#3b82f6',
					...props
				}: {
					position: [number, number];
					color?: string;
					[key: string]: any;
				}) {
					return <Marker position={position} icon={createCustomIcon(color)} {...props} />;
				};
			});
		}),
	{ ssr: false },
);

// TypeScript interfaces - simplified
interface GeoJSONPoint {
	type: 'Point';
	coordinates: [number, number]; // [longitude, latitude]
}

interface MapPickerValue {
	geojson: GeoJSONPoint;
	srid: number;
	x: number;
	y: number;
}

interface MapPickerProps {
	value?: MapPickerValue | GeoJSONPoint | any; // Accept various formats
	onChange?: (value: MapPickerValue | undefined) => void;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
	height?: number;
	markerColor?: string;
}

interface SearchResult {
	display_name: string;
	lat: string;
	lon: string;
	place_id: string;
}

// Map event handler component
const MapEventHandler = dynamic(
	() =>
		import('react-leaflet').then((mod) => {
			const { useMapEvents, useMap } = mod;
			return function MapEventHandlerInner({
				onMapClick,
				position,
			}: {
				onMapClick: (lat: number, lng: number) => void;
				position: [number, number] | null;
			}) {
				const map = useMap();

				useMapEvents({
					click(e: LeafletMouseEvent) {
						onMapClick(e.latlng.lat, e.latlng.lng);
					},
				});

				// Update map view when position changes
				useEffect(() => {
					if (position && map) {
						map.setView(position, 15);
					}
				}, [position, map]);

				return null;
			};
		}),
	{ ssr: false },
);

// Utility functions
const createMapValue = (lat: number, lng: number): MapPickerValue => ({
	geojson: {
		type: 'Point',
		coordinates: [lng, lat], // GeoJSON uses [longitude, latitude]
	},
	srid: 4326, // WGS84 coordinate system
	x: lng,
	y: lat,
});

// Improved coordinate extraction with better type checking
const extractPosition = (value: any): [number, number] | null => {
	if (!value) return null;

	let coordinates: [number, number] | undefined;

	// Handle raw GeoJSON Point (most common case from PostGIS)
	if (value.type === 'Point' && Array.isArray(value.coordinates)) {
		coordinates = value.coordinates;
	}
	// Handle wrapped MapPickerValue format
	else if (value.geojson?.type === 'Point' && Array.isArray(value.geojson.coordinates)) {
		coordinates = value.geojson.coordinates;
	}
	// Handle wrapped geometry format from PostGIS
	else if (value.geojson?.type === 'Point' && Array.isArray(value.geojson.coordinates)) {
		coordinates = value.geojson.coordinates;
	}

	if (!coordinates || coordinates.length < 2) return null;

	const [lng, lat] = coordinates;

	// Validate coordinates
	if (typeof lng !== 'number' || typeof lat !== 'number') return null;
	if (!isFinite(lng) || !isFinite(lat)) return null;

	// Return in Leaflet format [latitude, longitude]
	return [lat, lng];
};

// Search function using Nominatim API
const searchLocation = async (query: string): Promise<SearchResult[]> => {
	if (!query.trim()) return [];

	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
		);
		const results = await response.json();
		return results || [];
	} catch (error) {
		console.error('Search error:', error);
		return [];
	}
};

export function MapPicker({
	value,
	onChange,
	className,
	placeholder = 'Search for a location...',
	disabled = false,
	height = 300,
	markerColor = '#3b82f6',
}: MapPickerProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Extract position from any supported format
	const position = extractPosition(value);

	const defaultCenter: [number, number] = [40.7128, -74.006]; // NYC default

	// Handle map click
	const handleMapClick = useCallback(
		(lat: number, lng: number) => {
			if (disabled) return;

			const newValue = createMapValue(lat, lng);
			onChange?.(newValue);

			// Clear search when clicking on map
			setSearchQuery('');
			setShowResults(false);
		},
		[disabled, onChange],
	);

	// Handle search input change
	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);

		// Clear previous timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// Debounce search
		searchTimeoutRef.current = setTimeout(async () => {
			if (query.trim()) {
				setIsSearching(true);
				setShowResults(true);
				const results = await searchLocation(query);
				setSearchResults(results);
				setIsSearching(false);
			} else {
				setShowResults(false);
				setSearchResults([]);
			}
		}, 300);
	}, []);

	// Handle search result selection
	const handleResultSelect = useCallback(
		(result: SearchResult) => {
			if (disabled) return;

			const lat = parseFloat(result.lat);
			const lng = parseFloat(result.lon);
			const newValue = createMapValue(lat, lng);

			onChange?.(newValue);
			setSearchQuery(result.display_name);
			setShowResults(false);
		},
		[disabled, onChange],
	);

	// Clear search
	const clearSearch = useCallback(() => {
		setSearchQuery('');
		setShowResults(false);
		setSearchResults([]);
	}, []);

	// Clear location
	const clearLocation = useCallback(() => {
		if (disabled) return;
		onChange?.(undefined);
		setSearchQuery('');
	}, [disabled, onChange]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	// Mark map as loaded after mount
	useEffect(() => {
		setIsMapLoaded(true);
	}, []);

	return (
		<div className={cn('relative w-full', className)}>
			{/* Search Input */}
			<div className='mb-2'>
				<InputGroup>
					<InputGroupAddon>
						<SearchIcon />
					</InputGroupAddon>
					<InputGroupInput
						type='text'
						placeholder={placeholder}
						value={searchQuery}
						onChange={handleSearchChange}
						disabled={disabled}
					/>
					<InputGroupAddon align='inline-end'>
						{searchQuery && (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={clearSearch}
								disabled={disabled}
								className='h-7 w-7 p-0'
							>
								<XIcon className='h-3 w-3' />
							</Button>
						)}
						{position && (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={clearLocation}
								disabled={disabled}
								className='h-7 w-7 p-0'
							>
								<MapPinIcon className='h-3 w-3' />
							</Button>
						)}
					</InputGroupAddon>
				</InputGroup>

				{/* Search Results */}
				{showResults && (
					<Card className='absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto'>
						<CardContent className='p-0'>
							{isSearching && <div className='text-muted-foreground px-3 py-2 text-sm'>Searching...</div>}
							{!isSearching && searchResults.length === 0 && searchQuery && (
								<div className='text-muted-foreground px-3 py-2 text-sm'>No results found</div>
							)}
							{!isSearching &&
								searchResults.map((result) => (
									<button
										key={result.place_id}
										onClick={() => handleResultSelect(result)}
										disabled={disabled}
										className='hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm
											disabled:cursor-not-allowed disabled:opacity-50'
									>
										{result.display_name}
									</button>
								))}
						</CardContent>
					</Card>
				)}
			</div>

			{/* Map Container */}
			<Card className='overflow-hidden'>
				<CardContent className='p-0'>
					{isMapLoaded && (
						<div style={{ height: `${height}px` }} className='relative'>
							<MapContainer
								center={position || defaultCenter}
								zoom={position ? 15 : 10}
								style={{ height: '100%', width: '100%' }}
								className={cn('z-0', disabled && 'pointer-events-none opacity-50')}
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
								/>

								{position && <CustomMarker position={position} color={markerColor} />}

								<MapEventHandler onMapClick={handleMapClick} position={position} />
							</MapContainer>

							{/* Overlay for disabled state */}
							{disabled && <div className='bg-background/50 absolute inset-0 z-10' />}
						</div>
					)}

					{/* Loading state */}
					{!isMapLoaded && (
						<div style={{ height: `${height}px` }} className='bg-muted flex items-center justify-center'>
							<div className='text-muted-foreground text-sm'>Loading map...</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Current Location Info */}
			{position && (
				<div className='text-muted-foreground mt-2 text-xs'>
					<div className='flex items-center gap-1'>
						<MapPinIcon className='h-3 w-3' />
						<span>
							Latitude: {position[0].toFixed(6)}, Longitude: {position[1].toFixed(6)}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
