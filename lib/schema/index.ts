export interface InputSchema {
  id: string;
  label: string;
  type: 'slider' | 'select' | 'date' | 'text' | 'number';
  min?: number;
  max?: number;
  step?: number;
  default: any;
  unit?: string;
  suffix?: string;
  options?: any[];
  optionNames?: Record<string, string>;
  placeholder?: string;
}

export interface OutputSchema {
  id: string;
  label: string;
  type: 'currency' | 'number' | 'text';
  isHero?: boolean;
  suffix?: string;
}

export interface CalculatorInfo {
  formula: string;
  explanation: string;
  insights: string[];
  examples?: string[];
  faq?: { q: string; a: string }[];
  usage?: string;
}

export interface CalculatorSchema {
  id: string;
  title: string;
  description: string;
  category: 'finance' | 'health' | 'utility';
  color: 'indigo' | 'emerald' | 'pink' | 'amber';
  icon: string;
  popular?: boolean;
  seoTitle?: string;
  seoMeta?: string;
  type?: string;
  inputs?: InputSchema[];
  outputs?: OutputSchema[];
  calculate?: (inputs: Record<string, any>) => {
    results: Record<string, string>;
    chartData?: {
      points: { x: any; y: number }[];
      xLabel: string;
      yLabel: string;
    };
    gaugeData?: {
      value: number;
      min: number;
      max: number;
    };
  };
  info?: CalculatorInfo;
}
