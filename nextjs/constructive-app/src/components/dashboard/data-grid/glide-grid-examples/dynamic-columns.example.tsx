import React from 'react';

import { DataEditorAll as DataEditor } from '../../data-editor-all.js';
import { BeautifulWrapper, defaultProps, Description, MoreInfo } from '../../data-editor/stories/utils.js';
import { SimpleThemeWrapper } from '../../stories/story-utils.js';

export function useMockDataGenerator(numCols: number, readonly: boolean = true, group: boolean = false) {
	const cache = React.useRef<ContentCache>(new ContentCache());

	const [colsMap, setColsMap] = React.useState(() => getResizableColumns(numCols, group));

	React.useEffect(() => {
		setColsMap(getResizableColumns(numCols, group));
	}, [group, numCols]);

	const onColumnResize = React.useCallback((column: GridColumn, newSize: number) => {
		setColsMap((prevColsMap) => {
			const index = prevColsMap.findIndex((ci) => ci.title === column.title);
			const newArray = [...prevColsMap];
			newArray.splice(index, 1, {
				...prevColsMap[index],
				width: newSize,
			});
			return newArray;
		});
	}, []);

	const cols = React.useMemo(() => {
		return colsMap.map(getGridColumn);
	}, [colsMap]);

	const colsMapRef = React.useRef(colsMap);
	colsMapRef.current = colsMap;
	const getCellContent = React.useCallback(
		([col, row]: Item): GridCell => {
			let val = cache.current.get(col, row);
			if (val === undefined) {
				val = colsMapRef.current[col].getContent();
				if (!readonly && isTextEditableGridCell(val)) {
					val = { ...val, readonly };
				}
				cache.current.set(col, row, val);
			}
			return val;
		},
		[readonly],
	);

	const setCellValueRaw = React.useCallback(([col, row]: Item, val: GridCell): void => {
		cache.current.set(col, row, val);
	}, []);

	const setCellValue = React.useCallback(
		([col, row]: Item, val: GridCell): void => {
			let current = cache.current.get(col, row);
			if (current === undefined) {
				current = colsMap[col].getContent();
			}
			if (isEditableGridCell(val) && isEditableGridCell(current)) {
				const copied = lossyCopyData(val, current);
				cache.current.set(col, row, {
					...copied,
					displayData: typeof copied.data === 'string' ? copied.data : (copied as any).displayData,
					lastUpdated: performance.now(),
				} as any);
			}
		},
		[colsMap],
	);

	return { cols, getCellContent, onColumnResize, setCellValue, setCellValueRaw };
}

export default {
	title: 'Glide-Data-Grid/DataEditor Demos',

	decorators: [
		(Story: React.ComponentType) => (
			<SimpleThemeWrapper>
				<BeautifulWrapper
					title='Add and remove columns'
					description={
						<>
							<Description>You can add and remove columns at your disposal</Description>
							<MoreInfo>Use the story&apos;s controls to change the number of columns</MoreInfo>
						</>
					}
				>
					<Story />
				</BeautifulWrapper>
			</SimpleThemeWrapper>
		),
	],
};

interface AddColumnsProps {
	columnsCount: number;
}

export const AddColumns: React.FC<AddColumnsProps> = (p) => {
	const { cols, getCellContent } = useMockDataGenerator(p.columnsCount);

	return (
		<DataEditor
			{...defaultProps}
			rowMarkers='number'
			getCellContent={getCellContent}
			experimental={{ strict: true }}
			columns={cols}
			rows={10_000}
		/>
	);
};
(AddColumns as any).args = {
	columnsCount: 10,
};
(AddColumns as any).argTypes = {
	columnsCount: {
		control: {
			type: 'range',
			min: 2,
			max: 200,
		},
	},
};
