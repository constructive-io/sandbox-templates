import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { optionLabels } from '../names.ts';

describe('optionLabels', () => {
	// [the values a column allows, their labels, why]
	const cases: Array<[string[], string[], string]> = [
		[['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'], ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'], 'sizes are codes'],
		[['USD', 'EUR', 'GBP'], ['USD', 'EUR', 'GBP'], 'currencies are codes'],
		[['VIP', 'ID'], ['VIP', 'ID'], 'three capitals or fewer are a code'],
		[['A', 'B', 'C'], ['A', 'B', 'C'], 'a single capital is a code'],
		[['in_progress', 'done'], ['In progress', 'Done'], 'snake_case reads as a sentence'],
		[['highPriority', 'lowPriority'], ['High priority', 'Low priority'], 'camelCase reads as a sentence'],
		[['p1', 'p2'], ['P1', 'P2'], 'lowercase is sentence-cased like any value'],
		[['VIP_member', 'member'], ['VIP member', 'Member'], 'a code keeps its capitals beside lowercase words'],
		// Constants: no lowercase anywhere and a word that is no code, as a GraphQL enum writes them.
		[['OPEN', 'IN_PROGRESS', 'DONE'], ['Open', 'In progress', 'Done'], 'IN inside a constant is a word'],
		[['LOW', 'MEDIUM', 'HIGH'], ['Low', 'Medium', 'High'], 'LOW reads like its set'],
		[['NEW', 'OPEN', 'CLOSED'], ['New', 'Open', 'Closed'], 'NEW reads like its set'],
		[['VIP_MEMBER', 'MEMBER'], ['Vip member', 'Member'], 'a constant is sentence-cased whole, as IN_PROGRESS is'],
		[['OPEN'], ['Open'], 'OPEN alone is a constant'],
		[['NEW'], ['NEW'], 'NEW alone looks like any three-letter code'],
	];
	for (const [values, labels, why] of cases) {
		it(`${values.join(', ')}: ${why}`, () => assert.deepEqual(optionLabels(values), labels));
	}
});
