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

export interface FuzzySet {
	type: ShapeType;
	parameters: Record<string, number>;
	data: number[];
}

export interface LinguisticVariable {
	labels: number[];
	upperBoundary: number;
	lowerBoundary: number;
	graphs: Record<string, FuzzySet>;
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
	}
>;

export interface Settings {
	linguisticVariables: Record<string, LinguisticVariable>;
}
