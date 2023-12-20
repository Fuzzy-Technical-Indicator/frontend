export interface DTValue<T> {
	time: number;
	value: T;
}

export interface Ohlc {
	ticker: string;
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
}

export enum Interval {
	OneHour = '1h',
	FourHour = '4h',
	OneDay = '1d'
}

export enum ShapeType {
	Triangle = 'triangle',
	Trapezoid = 'trapezoid'
}

export enum LinguisticVarKind {
	Input = 'input',
	Output = 'output'
}

export interface FuzzySet {
	shapeType: ShapeType;
	parameters: Record<string, number>;
	latex: string[];
}

export interface LinguisticVariable {
	upperBoundary: number;
	lowerBoundary: number;
	shapes: Record<string, FuzzySet>;
	kind: LinguisticVarKind;
}

export type UpdateLinguisticVariable = Record<
	string,
	{
		upperBoundary: number;
		lowerBoundary: number;
		shapes: Record<
			string,
			{
				shapeType: string;
				parameters: Record<string, number>;
			}
		>;
		kind: LinguisticVarKind;
	}
>;

export interface FuzzyRule {
	id: string;
	input: Record<string, string>;
	output: Record<string, string>;
	valid: boolean;
}

export interface NewFuzzyRule {
	input: Record<string, string>;
	output: Record<string, string>;
}

export interface Settings {
	linguisticVariables: Record<string, LinguisticVariable>;
	fuzzyRules: FuzzyRule[];
}
