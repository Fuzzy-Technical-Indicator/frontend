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

export interface BBSetting {
	length: number;
	stdev: number;
}

export interface LengthSetting {
	length: number;
}

export interface MacdSetting {
	fast: number;
	slow: number;
	smooth: number;
}

export interface StochSetting {
	k: number;
	d: number;
	length: number;
}

export interface UserSettings {
	bb: BBSetting;
	rsi: LengthSetting;
	adx: LengthSetting;
	aroon: LengthSetting;
	macd: MacdSetting;
	stoch: StochSetting;
}

export type UpdateUserSettings =
	| { bb: BBSetting }
	| { rsi: LengthSetting }
	| { adx: LengthSetting }
	| { aroon: LengthSetting }
	| { macd: MacdSetting }
	| { stoch: StochSetting };

export interface Trades {
	pnl: number;
	pnl_percent: number;
	trades: number;
}

export interface MaximumDrawdown {
	amount: number;
	percent: number;
}

export interface CumalativeReturn {
	time: number;
	value: number;
}

export enum PosType {
	Long = 'long',
	Short = 'short'
}

export interface SignalCondition {
	signal_index: number;
	signal_threshold: number;
	signal_do_command: PosType;
	min_entry_size: number,
	entry_size_percent: number;
	take_profit_when: number;
	stop_loss_when: number;
}

export interface BacktestRequest {
	tag: 'NormalBackTest';
	capital: number;
	start_time: number;
	end_time: number;
	signal_conditions: SignalCondition[];
}

export interface PsoBacktest {
	tag: 'PsoBackTest';
	capital: number;
	start_time: number;
	train_end_time: number;
	validation_end_time: number;
	signal_conditions: SignalCondition[];
}

export interface BacktestResult {
	metadata: BacktestRequest | PsoBacktest;
	maximum_drawdown: MaximumDrawdown;
	profit_trades: Trades;
	loss_trades: Trades;
	total: Trades;
	cumalative_return: CumalativeReturn[];
}

export interface BacktestReport {
	_id: string;
	username: string;
	ticker: string;
	interval: Interval;
	fuzzy_preset: string;
	backtest_result: BacktestResult;
	backtest_id: string;
	run_at: number;
}

export interface PsoResult {
	preset: string;
	train_progress: { epoch: number; group: number; f: number }[];
	validation_f: number;
	start_time: number;
	train_end_time: number;
	validation_end_time: number;
	backtest_id: string;
	run_at: number;
	_id: string;
}
