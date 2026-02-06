import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { AlertCircle, FileText, Loader2, Map, MapPin, Shuffle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@constructive-io/ui/button';
import { Label } from '@constructive-io/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@constructive-io/ui/tabs';
import { Textarea } from '@constructive-io/ui/textarea';

import { EditorFocusTrap } from './editor-focus-trap';

// Lazy load MapPicker to avoid bundling ~270KB Leaflet in main chunk
const MapPicker = dynamic(() => import('@/components/map-picker').then((m) => m.MapPicker), {
	ssr: false,
	loading: () => (
		<div className="flex h-[400px] w-full items-center justify-center rounded-lg border bg-muted/30">
			<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
		</div>
	),
});

// GeoJSON validation according to RFC 7946
const VALID_GEOJSON_TYPES = [
	'Point',
	'LineString',
	'Polygon',
	'MultiPoint',
	'MultiLineString',
	'MultiPolygon',
	'GeometryCollection',
	'Feature',
	'FeatureCollection',
];

interface GeometryType {
	geojson: any; // GeoJSON object
	srid: number; // Integer
	x: number; // Float
	y: number; // Float
}

interface MapPickerValue {
	geojson: {
		type: 'Point';
		coordinates: [number, number];
	};
	srid: number;
	x: number;
	y: number;
}

function isValidGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;

	// Must have a type property
	if (!obj.type || typeof obj.type !== 'string') return false;

	// Type must be one of the valid GeoJSON types
	if (!VALID_GEOJSON_TYPES.includes(obj.type)) return false;

	// Basic structure validation based on type
	switch (obj.type) {
		case 'Point':
			return Array.isArray(obj.coordinates) && obj.coordinates.length >= 2;
		case 'LineString':
			return (
				Array.isArray(obj.coordinates) &&
				obj.coordinates.length >= 2 &&
				obj.coordinates.every((coord: any) => Array.isArray(coord) && coord.length >= 2)
			);
		case 'Polygon':
			return (
				Array.isArray(obj.coordinates) &&
				obj.coordinates.length >= 1 &&
				obj.coordinates.every((ring: any) => Array.isArray(ring) && ring.length >= 4)
			);
		case 'Feature':
			return obj.geometry !== undefined && obj.properties !== undefined;
		case 'FeatureCollection':
			return Array.isArray(obj.features);
		default:
			return true; // For other types, basic structure check is enough
	}
}

function isValidGeometry(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;

	// Must have all required properties
	if (!('geojson' in obj) || !('srid' in obj) || !('x' in obj) || !('y' in obj)) {
		return false;
	}

	// Validate geojson
	if (!isValidGeoJSON(obj.geojson)) return false;

	// Validate srid (must be integer)
	if (!Number.isInteger(obj.srid)) return false;

	// Validate x and y (must be finite numbers)
	if (!Number.isFinite(obj.x) || !Number.isFinite(obj.y)) return false;

	return true;
}

// Accept wrapped objects which only contain a valid `geojson` property (no srid/x/y)
function isWrappedGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!('geojson' in obj)) return false;
	return isValidGeoJSON((obj as any).geojson);
}

function validateGeometry(jsonString: string): boolean | string {
	if (!jsonString.trim()) return true; // Allow empty

	try {
		const parsed = JSON.parse(jsonString);

		if (!isValidGeometry(parsed)) {
			return 'Invalid geometry format. Must have geojson, srid (integer), x (number), and y (number) properties with valid GeoJSON.';
		}

		return true;
	} catch {
		return 'Invalid JSON format';
	}
}

// Helper functions for map integration
function isPointGeometry(geometry: GeometryType | null | undefined): boolean {
	return !!(geometry?.geojson?.type === 'Point' && Array.isArray(geometry.geojson.coordinates));
}

// Format geometry for display
function formatGeometry(val: any): string {
	if (val === null || val === undefined) return '';

	try {
		if (typeof val === 'string') {
			// Try to parse if it's a JSON string
			const parsed = JSON.parse(val);
			return JSON.stringify(parsed, null, 2);
		} else if (typeof val === 'object') {
			return JSON.stringify(val, null, 2);
		} else {
			return String(val);
		}
	} catch {
		return String(val);
	}
}

// Parse geometry data from cell
function parseGeometryValue(value: any): GeometryType | null {
	if (!value) return null;

	try {
		let parsed = value;
		if (typeof value === 'string') {
			parsed = JSON.parse(value);
		}

		// If it's already a valid geometry object
		if (isValidGeometry(parsed)) {
			return parsed;
		}

		// If it's raw GeoJSON, wrap it in geometry format
		if (isValidGeoJSON(parsed)) {
			let x = 0,
				y = 0;
			if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
				x = parsed.coordinates[0]; // longitude
				y = parsed.coordinates[1]; // latitude
			}

			return {
				geojson: parsed,
				srid: 4326, // Default SRID for WGS84
				x: Number(x),
				y: Number(y),
			};
		}

		// If it's a wrapped object which only has `geojson`, also accept it
		if (isWrappedGeoJSON(parsed)) {
			const gj = (parsed as any).geojson;
			let x = 0,
				y = 0;
			if (gj.type === 'Point' && Array.isArray(gj.coordinates)) {
				x = gj.coordinates[0];
				y = gj.coordinates[1];
			}

			return {
				geojson: gj,
				srid: Number((parsed as any).srid) || 4326,
				x: Number(x),
				y: Number(y),
			};
		}

		return null;
	} catch {
		return null;
	}
}

interface GeometryEditorProps {
	value: GridCell;
	onFinishedEditing: (newValue?: GridCell) => void;
}

export const GeometryEditor: React.FC<GeometryEditorProps> = ({ value, onFinishedEditing }) => {
	// Extract current geometry data from the cell
	const currentGeometryData = value.kind === GridCellKind.Text ? value.data : '';
	const geometryValue = parseGeometryValue(currentGeometryData);

	const [editingValue, setEditingValue] = useState<string>(
		currentGeometryData ? formatGeometry(currentGeometryData) : '',
	);
	const [isValid, setIsValid] = useState(true);
	const [activeTab, setActiveTab] = useState<'map' | 'json'>('map');

	const canShowMap = geometryValue ? isPointGeometry(geometryValue) : true; // Default to map for empty values

	// Set initial tab based on geometry type
	useEffect(() => {
		setActiveTab(canShowMap ? 'map' : 'json');
	}, [canShowMap]);

	const handleValueChange = useCallback((newValue: string) => {
		setEditingValue(newValue);
		const validation = validateGeometry(newValue);
		setIsValid(validation === true);
	}, []);

	const handleMapChange = useCallback((mapValue: MapPickerValue | undefined) => {
		if (mapValue) {
			// Extract the raw GeoJSON from the MapPickerValue
			const rawGeoJSON = mapValue.geojson;
			if (rawGeoJSON && rawGeoJSON.type) {
				// Update the editing textarea with JSON string
				const jsonString = JSON.stringify(rawGeoJSON, null, 2);
				setEditingValue(jsonString);
				setIsValid(true);
			}
		} else {
			setEditingValue('');
			setIsValid(true);
		}
	}, []);

	const generateRandomGeometry = useCallback((): GeometryType => {
		// Sample famous locations around the world
		const sampleLocations = [
			{ name: 'Times Square, NYC', lng: -73.985, lat: 40.758 },
			{ name: 'Eiffel Tower, Paris', lng: 2.294, lat: 48.858 },
			{ name: 'Big Ben, London', lng: -0.124, lat: 51.499 },
			{ name: 'Golden Gate Bridge, SF', lng: -122.478, lat: 37.819 },
			{ name: 'Sydney Opera House', lng: 151.215, lat: -33.857 },
		];

		const geometryTypes = ['Point', 'LineString', 'Polygon'];
		const randomType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
		const baseLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
		const baseLng = baseLocation.lng;
		const baseLat = baseLocation.lat;

		let geojson: any;

		switch (randomType) {
			case 'Point':
				geojson = {
					type: 'Point',
					coordinates: [baseLng, baseLat],
				};
				break;

			case 'LineString':
				const pathPoints = [];
				for (let i = 0; i < 4; i++) {
					pathPoints.push([
						Number(baseLng + (Math.random() - 0.5) * 0.01),
						Number(baseLat + (Math.random() - 0.5) * 0.01),
					]);
				}
				geojson = {
					type: 'LineString',
					coordinates: pathPoints,
				};
				break;

			case 'Polygon':
				const offset = 0.005;
				geojson = {
					type: 'Polygon',
					coordinates: [
						[
							[Number(baseLng - offset), Number(baseLat - offset)],
							[Number(baseLng + offset), Number(baseLat - offset)],
							[Number(baseLng + offset), Number(baseLat + offset)],
							[Number(baseLng - offset), Number(baseLat + offset)],
							[Number(baseLng - offset), Number(baseLat - offset)], // Close the ring
						],
					],
				};
				break;
		}

		// Extract coordinates for x, y (use first coordinate for complex geometries)
		let x = baseLng,
			y = baseLat;
		if (geojson.type === 'Point') {
			x = geojson.coordinates[0];
			y = geojson.coordinates[1];
		}

		return {
			geojson,
			srid: 4326, // Standard WGS84
			x: Number(x),
			y: Number(y),
		};
	}, []);

	const handleRandomize = useCallback(() => {
		const randomGeometry = generateRandomGeometry();
		const formattedGeometry = formatGeometry(randomGeometry);
		setEditingValue(formattedGeometry);
		setIsValid(true);
	}, [generateRandomGeometry]);

	const handleSave = useCallback(() => {
		if (!isValid) return;

		let finalValue: string;

		if (!editingValue.trim()) {
			finalValue = '';
		} else {
			try {
				const parsed = JSON.parse(editingValue);
				// Store as JSON string for the database
				finalValue = JSON.stringify(parsed);
			} catch {
				finalValue = editingValue;
			}
		}

		// Return updated Text cell with geometry data
		onFinishedEditing({
			kind: GridCellKind.Text,
			data: finalValue,
			displayData: finalValue,
			allowOverlay: true,
		});
	}, [editingValue, isValid, onFinishedEditing]);

	const handleCancel = useCallback(() => {
		// Signal cancel without committing
		onFinishedEditing();
	}, [onFinishedEditing]);

	// Handle Ctrl+Enter to save
	const handleEditorKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				if (isValid) handleSave();
			}
		},
		[isValid, handleSave],
	);

	const getMapPickerValue = useMemo(() => {
		// Prefer the current editing buffer so the map reflects in-flight changes
		try {
			if (editingValue && typeof editingValue === 'string') {
				const parsed = JSON.parse(editingValue);
				if (isValidGeoJSON(parsed)) {
					return parsed; // raw GeoJSON
				}
				if (isValidGeometry(parsed)) {
					return (parsed as any).geojson; // wrapped geometry object
				}
				if (isWrappedGeoJSON(parsed)) {
					return (parsed as any).geojson; // wrapped geojson only
				}
			}
		} catch {
			// ignore parse errors and fall back to initial value
		}

		// Fallback to initial geometry value from props
		if (geometryValue && isPointGeometry(geometryValue)) {
			return geometryValue.geojson;
		}

		return undefined;
	}, [editingValue, geometryValue]);

	return (
		<EditorFocusTrap
			onEscape={handleCancel}
			className='bg-background border-border/60 flex w-full max-w-4xl min-w-[600px] flex-col gap-0 overflow-y-visible rounded-lg border p-0 shadow-lg'
		>
			<div onKeyDown={handleEditorKeyDown}>
			{/* Header */}
			<div className='border-b px-6 py-4'>
				<div className='flex items-center gap-2'>
					<MapPin className='text-muted-foreground h-4 w-4' />
					<h3 className='text-base font-semibold'>Edit Geometry</h3>
				</div>
			</div>

			<div className='overflow-y-auto'>
				{/* Editor */}
				<div className='px-6 py-6'>
					<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'map' | 'json')} className='w-full'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='map' className='flex items-center gap-2'>
								<Map className='h-4 w-4' />
								Map View
							</TabsTrigger>
							<TabsTrigger value='json' className='flex items-center gap-2'>
								<FileText className='h-4 w-4' />
								Raw JSON
							</TabsTrigger>
						</TabsList>

						<TabsContent value='map' className='mt-4 space-y-4'>
							{canShowMap || !geometryValue ? (
								<div className='space-y-4'>
									<MapPicker
										value={getMapPickerValue}
										onChange={handleMapChange}
										height={400}
										placeholder='Search for a location or click on the map...'
									/>
									{getMapPickerValue && (
										<div className='text-muted-foreground bg-muted/50 rounded p-3 text-xs'>
											<strong>Current Point:</strong> Lat:{' '}
											{getMapPickerValue.coordinates ? getMapPickerValue.coordinates[1].toFixed(6) : 'N/A'}, Lng:{' '}
											{getMapPickerValue.coordinates ? getMapPickerValue.coordinates[0].toFixed(6) : 'N/A'}, SRID: 4326
										</div>
									)}
								</div>
							) : (
								<div
									className='bg-muted/30 flex h-[400px] flex-col items-center justify-center space-y-4 rounded-lg
										text-center'
								>
									<AlertCircle className='text-muted-foreground h-12 w-12' />
									<div>
										<h3 className='font-medium'>Map View Not Available</h3>
										<p className='text-muted-foreground mt-2 text-sm'>
											Map view only supports Point geometries.
											<br />
											Current geometry type: <code>{geometryValue?.geojson?.type || 'Unknown'}</code>
											<br />
											Use the Raw JSON tab to edit complex geometries.
										</p>
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value='json' className='mt-4 space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='geometry-json'>Geometry JSON</Label>
								<Textarea
									id='geometry-json'
									value={editingValue}
									onChange={(e) => handleValueChange(e.target.value)}
									className={cn('min-h-[400px] resize-none font-mono text-sm', !isValid && 'border-destructive')}
									placeholder={JSON.stringify(
										{
											geojson: {
												type: 'Point',
												coordinates: [0, 0],
											},
											srid: 4326,
											x: 0,
											y: 0,
										},
										null,
										2,
									)}
									autoFocus={activeTab === 'json'}
								/>
							</div>

							{!isValid && (
								<div className='text-destructive flex items-center gap-2 text-sm'>
									<AlertCircle className='h-4 w-4' />
									Invalid geometry format. Must have geojson, srid (integer), x (number), and y (number) properties.
								</div>
							)}

							<div className='flex items-center justify-between'>
								<Button variant='outline' size='sm' onClick={handleRandomize} title='Generate random geometry'>
									<Shuffle className='mr-1 h-3 w-3' />
									Randomize
								</Button>
								<p className='text-muted-foreground text-xs'>Use Ctrl+Enter to save, Escape to cancel</p>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Footer */}
			<div className='flex justify-end gap-2 border-t px-6 py-4'>
				<Button type='button' variant='outline' onClick={handleCancel}>
					Cancel
				</Button>
				<Button type='button' onClick={handleSave} disabled={!isValid}>
					Save
				</Button>
			</div>
			</div>
		</EditorFocusTrap>
	);
};
