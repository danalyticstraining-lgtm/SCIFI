export enum ButtonVariant {
  DEFAULT = 'DEFAULT',
  OPERATOR = 'OPERATOR',
  ACTION = 'ACTION',
  FEATURE = 'FEATURE'
}

export enum CalculatorState {
  INPUT = 'INPUT',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface CalculationResult {
  result: string;
  explanation: string;
}

export interface HistoryItem {
  expression: string;
  result: string;
  explanation?: string;
}