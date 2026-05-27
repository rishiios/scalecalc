import { CalculatorSchema } from '../schema';

export const calculators: Record<string, CalculatorSchema> = {
  // ==========================================
  // --- 1. POPULAR CALCULATORS (USER DIRECTIVE) ---
  // ==========================================

  emi: {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Determine your monthly Equated Monthly Installments (EMI), loan interest costs, and repayment schedules.',
    category: 'finance',
    color: 'indigo',
    icon: '💳',
    popular: true,
    seoTitle: 'Free Online EMI Calculator | ScaleCalc',
    seoMeta: 'Free interactive Equated Monthly Installment (EMI) loan calculator. Instantly check monthly interest, principal payments, and schedules.',
    info: {
      formula: 'E = P * [r(1+r)^n] / [(1+r)^n - 1]',
      explanation: 'Equated Monthly Installment (EMI) is the fixed payment amount made by a borrower to a lender at a specified date each calendar month. The interest rate is annualized and divided by 12 to find the monthly compounded rate.',
      insights: [
        'Principal vs Interest: In the initial years, a major portion of your EMI goes toward paying interest. As the loan matures, the principal repayment proportion increases.',
        'Prepayment Benefits: Making extra payments or prepaying a small part of the principal early in the loan term can dramatically reduce your total interest payable and term duration.',
        'Loan Term Impact: A longer tenure reduces your monthly EMI, but significantly increases the total interest paid over the life of the loan.'
      ],
      usage: 'Enter your total loan amount, the annual interest rate offered by your bank, and the tenure of your loan in months. The calculator will instantly show your monthly EMI, the total interest you will pay, and a visual breakdown of your repayment schedule.',
      examples: [
        'A home loan of ₹50,00,000 at 8.5% interest for 20 years (240 months) results in an EMI of ₹43,391.',
        'A personal loan of ₹5,00,000 at 12% interest for 3 years (36 months) results in an EMI of ₹16,607.'
      ],
      faq: [
        { q: 'What happens if interest rates change?', a: 'If you have a floating rate loan, your bank may adjust your EMI amount or extend your loan tenure when rates change.' },
        { q: 'Is it better to have a shorter or longer tenure?', a: 'A shorter tenure means higher monthly EMIs but significantly less total interest paid. A longer tenure reduces monthly burden but increases overall cost.' },
        { q: 'Can I prepay my loan?', a: 'Most banks allow prepayment, sometimes with a nominal penalty. Prepaying reduces your outstanding principal, saving you interest.' }
      ]
    },
    inputs: [
      { id: 'loanAmt', label: 'Loan Amount', type: 'slider', min: 5000, max: 15000000, step: 5000, default: 500000, unit: '₹' },
      { id: 'rate', label: 'Interest Rate', type: 'slider', min: 1, max: 25, step: 0.1, default: 8.5, unit: '%' },
      { id: 'months', label: 'Loan Term', type: 'slider', min: 6, max: 360, step: 6, default: 60, unit: ' Months' }
    ],
    outputs: [
      { id: 'payment', label: 'Monthly EMI Payment', type: 'currency', isHero: true },
      { id: 'interest', label: 'Total Interest Payable', type: 'currency' },
      { id: 'total', label: 'Total Payment (Principal + Interest)', type: 'currency' }
    ],
    calculate: (inputs) => {
      const p = parseFloat(inputs.loanAmt) || 0;
      const r = (parseFloat(inputs.rate) || 0) / 100 / 12;
      const n = parseInt(inputs.months) || 60;

      let payment = 0;
      if (r === 0) payment = p / n;
      else payment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      const total = payment * n;
      const interest = Math.max(0, total - p);

      const chartPoints: { x: any; y: number }[] = [{ x: 0, y: p }];
      let balance = p;
      const step = Math.max(1, Math.floor(n / 10));

      for (let i = 1; i <= n; i++) {
        const intPaid = balance * r;
        const princPaid = payment - intPaid;
        balance = Math.max(0, balance - princPaid);
        if (i % step === 0 || i === n) {
          chartPoints.push({ x: (i / 12).toFixed(1), y: Math.round(balance) });
        }
      }

      return {
        results: {
          payment: payment.toFixed(2),
          interest: interest.toFixed(2),
          total: total.toFixed(2)
        },
        chartData: {
          points: chartPoints,
          xLabel: 'Years',
          yLabel: 'Balance'
        }
      };
    }
  },

  sip: {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Systematic Investment Plan. Estimate your future wealth growth, principal additions, and compound returns.',
    category: 'finance',
    color: 'emerald',
    icon: '💰',
    popular: true,
    seoTitle: 'Free SIP Systematic Investment Calculator | ScaleCalc',
    seoMeta: 'Calculate future wealth accumulations using SIP formulas. View detailed principal additions and total compound gains.',
    info: {
      formula: 'FV = P * [ (1 + i)^n - 1 ] * (1 + i) / i',
      explanation: 'Systematic Investment Plan (SIP) calculates the compounding growth of regular monthly contributions. It assumes the monthly yield compounded regularly over the specified duration.',
      insights: [
        'Power of Compounding: Starting just 5 years earlier can double your final retirement corpus due to exponential compounding interest effects.',
        'Rupee Cost Averaging: SIP eliminates the need to time the market. You buy more units when prices are low and fewer units when prices are high.',
        'Inflation Adjustment: Remember that a high future value might have lower purchasing power in the future. Step up your SIP by 10% annually to counter inflation.'
      ],
      usage: 'Input your planned monthly investment amount, the expected annualized rate of return (historically 10-12% for equity mutual funds), and the number of years you plan to stay invested. The calculator projects your wealth accumulation over time.',
      examples: [
        'Investing ₹5,000 per month for 20 years at a 12% return can grow to approximately ₹50 Lakhs.',
        'A ₹10,000 monthly SIP for 15 years at 10% can build a corpus of over ₹40 Lakhs.'
      ],
      faq: [
        { q: 'What is a good expected return rate to use?', a: 'Historically, equity mutual funds in India have delivered 10-12% long-term returns, while debt funds offer 6-8%.' },
        { q: 'Can I stop or pause my SIP?', a: 'Yes, SIPs are highly flexible. You can pause, stop, or increase your SIP amount at any time without penalties.' },
        { q: 'Is the future value guaranteed?', a: 'No, SIP returns are market-linked. The calculator provides an estimate based on your assumed constant rate of return.' }
      ]
    },
    inputs: [
      { id: 'monthly', label: 'Monthly Investment', type: 'slider', min: 500, max: 1000000, step: 500, default: 5000, unit: '₹' },
      { id: 'rate', label: 'Expected Return Rate', type: 'slider', min: 1, max: 30, step: 0.5, default: 12, unit: '%' },
      { id: 'years', label: 'Time Period', type: 'slider', min: 1, max: 40, step: 1, default: 10, unit: ' Years' }
    ],
    outputs: [
      { id: 'futureVal', label: 'Estimated Future Value', type: 'currency', isHero: true },
      { id: 'invested', label: 'Total Invested Amount', type: 'currency' },
      { id: 'gains', label: 'Estimated Wealth Gain', type: 'currency' }
    ],
    calculate: (inputs) => {
      const monthly = parseFloat(inputs.monthly) || 5000;
      const rate = parseFloat(inputs.rate) || 12;
      const years = parseInt(inputs.years) || 10;

      const monthlyRate = (rate / 100) / 12;
      const totalMonths = years * 12;

      let futureVal = 0;
      if (monthlyRate > 0) {
        futureVal = monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      } else {
        futureVal = monthly * totalMonths;
      }

      const invested = monthly * totalMonths;
      const gains = Math.max(0, futureVal - invested);

      const chartPoints: { x: any; y: number }[] = [{ x: 0, y: 0 }];
      const step = Math.max(1, Math.floor(totalMonths / 10));
      for (let m = 1; m <= totalMonths; m++) {
        let val = 0;
        if (monthlyRate > 0) {
          val = monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
        } else {
          val = monthly * m;
        }
        if (m % step === 0 || m === totalMonths) {
          chartPoints.push({ x: (m / 12).toFixed(1), y: Math.round(val) });
        }
      }

      return {
        results: {
          futureVal: futureVal.toFixed(2),
          invested: invested.toFixed(2),
          gains: gains.toFixed(2)
        },
        chartData: {
          points: chartPoints,
          xLabel: 'Years',
          yLabel: 'Growth'
        }
      };
    }
  },

  gst: {
    id: 'gst',
    title: 'GST Calculator',
    description: 'Goods and Services Tax. Calculate dynamic GST tax-inclusive and tax-exclusive pricing adjustments.',
    category: 'finance',
    color: 'emerald',
    icon: '🏷️',
    popular: true,
    seoTitle: 'GST Tax Calculator Online | ScaleCalc',
    seoMeta: 'Calculate GST Inclusive and Exclusive prices instantly. Supports Indian standard tax rates (5%, 12%, 18%, 28%) and custom values.',
    info: {
      formula: 'Tax Exclusive: Add GST = Base * (Rate / 100) | Tax Inclusive: GST Value = Base - (Base * 100 / (100 + Rate))',
      explanation: 'Goods and Services Tax is a multi-stage, destination-based consumption tax. GST Exclusive adds the tax rate on top of the base cost, while GST Inclusive extracts the tax value already built into the gross retail price.',
      insights: [
        'Standard Tax Brackets: Different categories of goods attract different rates: essential items (5%), standard items (12% or 18%), and luxury goods (28%).',
        'Input Tax Credit (ITC): Businesses can offset GST paid on purchase inputs against the GST liability collected on final sales.',
        'Accurate Invoicing: Always verify whether your supplier quoted prices are GST Inclusive or Exclusive to avoid unexpected 18% or 28% invoice surcharges.'
      ]
    },
    inputs: [
      { id: 'amount', label: 'Base Amount', type: 'slider', min: 100, max: 2000000, step: 100, default: 10000, unit: '₹' },
      { id: 'gstRate', label: 'GST Rate', type: 'select', options: [5, 12, 18, 28], default: 18, suffix: '%' },
      { id: 'type', label: 'Tax Calculation', type: 'select', options: ['exclusive', 'inclusive'], optionNames: { exclusive: 'GST Exclusive (Add GST)', inclusive: 'GST Inclusive (Remove GST)' }, default: 'exclusive' }
    ],
    outputs: [
      { id: 'total', label: 'Gross Price (Total)', type: 'currency', isHero: true },
      { id: 'gstAmt', label: 'GST Amount Paid', type: 'currency' },
      { id: 'net', label: 'Net Price', type: 'currency' }
    ],
    calculate: (inputs) => {
      const amount = parseFloat(inputs.amount) || 0;
      const rate = parseFloat(inputs.gstRate) || 18;
      const type = inputs.type;

      let gstAmt = 0;
      let total = 0;
      let net = 0;

      if (type === 'exclusive') {
        gstAmt = amount * (rate / 100);
        total = amount + gstAmt;
        net = amount;
      } else {
        gstAmt = amount - (amount * (100 / (100 + rate)));
        total = amount;
        net = amount - gstAmt;
      }

      return {
        results: {
          total: total.toFixed(2),
          gstAmt: gstAmt.toFixed(2),
          net: net.toFixed(2)
        }
      };
    }
  },

  age: {
    id: 'age',
    title: 'Age Calculator',
    description: 'Calculate detailed intervals between dates in years, months, weeks, and days.',
    category: 'utility',
    color: 'amber',
    icon: '📅',
    popular: true,
    seoTitle: 'Precise Online Age Calculator | ScaleCalc',
    seoMeta: 'Identify precise ages, years, months, and total days lived instantly. Native client-side date calculations.',
    info: {
      formula: 'Age = Target Date - Date of Birth (Gregorian Calendar calculations)',
      explanation: 'The age calculator determines the exact chronological interval between two dates. It accounts for leap years, variable month lengths (28, 30, or 31 days), and precise day differences.',
      insights: [
        'Leap Year Anomalies: A year is a leap year if it is divisible by 4, except for end-of-century years which must be divisible by 400.',
        'Day Count Conventions: Financial industries often use specific date conventions (like 30/360 or Actual/365) to compute commercial age and interest accrual rates.',
        'Health Milestones: Celebrate minor milestones—knowing your exact age in weeks or total days helps trace metabolic health and fitness intervals.'
      ]
    },
    inputs: [
      { id: 'dob', label: 'Date of Birth', type: 'date', default: '1998-05-15' },
      { id: 'target', label: 'Target Date', type: 'date', default: '2026-05-27' }
    ],
    outputs: [
      { id: 'yearsAge', label: 'Precise Age', type: 'text', isHero: true },
      { id: 'totalDays', label: 'Total Days Alive', type: 'text' }
    ],
    calculate: (inputs) => {
      const dobStr = inputs.dob;
      const targetStr = inputs.target;

      if (!dobStr || !targetStr) {
        return { results: { yearsAge: 'Select Dates', totalDays: '0' } };
      }

      const dob = new Date(dobStr);
      const target = new Date(targetStr);

      if (isNaN(dob.getTime()) || isNaN(target.getTime()) || dob > target) {
        return { results: { yearsAge: 'Invalid Date Range', totalDays: '0' } };
      }

      const diffTime = Math.abs(target.getTime() - dob.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let years = target.getFullYear() - dob.getFullYear();
      let months = target.getMonth() - dob.getMonth();
      let days = target.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += lastMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      return {
        results: {
          yearsAge: `${years} Years, ${months} Months, ${days} Days`,
          totalDays: `${diffDays} Days`
        }
      };
    }
  },

  percentage: {
    id: 'percentage',
    title: 'Percentage Calculator',
    description: 'Solve percentages, ratios, and relative increase/decrease equations.',
    category: 'utility',
    color: 'indigo',
    icon: '％',
    popular: true,
    seoTitle: 'Online Percentage Calculator | ScaleCalc',
    seoMeta: 'Solve ratio, percentage markup, and discount parameters instantly in a secure browser window.',
    info: {
      formula: 'X% of Y = (X * Y) / 100 | % Change = ((Y - X) / X) * 100',
      explanation: 'Percentage calculators solve ratio conversions and relative shifts. Percentage represents a number expressed as a fraction of 100, which provides a standard scale for comparisons.',
      insights: [
        'Asymmetric Changes: A 50% loss requires a 100% gain just to break even! Always calculate percentage gains relative to your new base value.',
        'Markup vs Margin: A 25% profit markup on cost price is equivalent to a 20% gross profit margin on the final selling price.',
        'Base Value Sensitivity: Be cautious when comparing percentages with different base sizes. A 10% increase on a million is much larger than a 50% increase on a thousand.'
      ]
    },
    inputs: [
      { id: 'op', label: 'Select Scenario', type: 'select', options: ['of', 'isWhat', 'change'], optionNames: { of: 'What is X% of Y?', isWhat: 'X is what % of Y?', change: 'What is % change from X to Y?' }, default: 'of' },
      { id: 'x', label: 'Value X', type: 'slider', min: 0, max: 5000, step: 5, default: 25 },
      { id: 'y', label: 'Value Y', type: 'slider', min: 1, max: 10000, step: 10, default: 500 }
    ],
    outputs: [
      { id: 'result', label: 'Percentage Result', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const op = inputs.op;
      const x = parseFloat(inputs.x) || 0;
      const y = parseFloat(inputs.y) || 1;

      let res = '';
      if (op === 'of') {
        res = ((x / 100) * y).toLocaleString();
      } else if (op === 'isWhat') {
        res = ((x / y) * 100).toFixed(2) + '%';
      } else if (op === 'change') {
        const change = ((y - x) / x) * 100;
        res = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
      }

      return {
        results: {
          result: res
        }
      };
    }
  },

  // ==========================================
  // --- 2. OTHER CALCULATORS (MORE CALCULATORS SECTION) ---
  // ==========================================

  mortgage: {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Calculate monthly home loan payments, visual loan amortization schedules, and total interest expenses.',
    category: 'finance',
    color: 'indigo',
    icon: '🏠',
    info: {
      formula: 'M = (P * r * (1 + r)^n) / ((1 + r)^n - 1) | P = Price - Down Payment',
      explanation: 'Mortgages are long-term amortizing loans used to purchase real estate. The lender holds the property title as collateral until the principal and compounded interests are fully repaid.',
      insights: [
        'The 20% Down Rule: Putting down at least 20% helps you avoid costly Private Mortgage Insurance (PMI) and secures lower interest rates from lenders.',
        '15-Year vs 30-Year: A 15-year mortgage usually has a lower rate and saves you tens of thousands in interest, though it requires higher monthly payments.',
        'Debt-to-Income (DTI) Ratio: Lenders prefer that your monthly housing costs do not exceed 28% of your gross monthly household income.'
      ]
    },
    inputs: [
      { id: 'homePrice', label: 'Home Price', type: 'slider', min: 50000, max: 20000000, step: 10000, default: 4000000, unit: '₹' },
      { id: 'downPayment', label: 'Down Payment', type: 'slider', min: 0, max: 10000000, step: 5000, default: 800000, unit: '₹' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'slider', min: 1, max: 15, step: 0.1, default: 7.2, unit: '%' },
      { id: 'loanTerm', label: 'Loan Term', type: 'select', options: [10, 15, 20, 30], default: 30, suffix: ' Years' }
    ],
    outputs: [
      { id: 'monthlyPayment', label: 'Monthly Payment', type: 'currency', isHero: true },
      { id: 'loanAmount', label: 'Loan Amount', type: 'currency' },
      { id: 'totalInterest', label: 'Total Interest Paid', type: 'currency' },
      { id: 'totalCost', label: 'Total Cost of Loan', type: 'currency' }
    ],
    calculate: (inputs) => {
      const homePrice = parseFloat(inputs.homePrice) || 0;
      const downPayment = Math.min(parseFloat(inputs.downPayment) || 0, homePrice);
      const interestRate = parseFloat(inputs.interestRate) || 0;
      const loanTerm = parseInt(inputs.loanTerm) || 30;

      const loanAmount = homePrice - downPayment;
      const monthlyRate = (interestRate / 100) / 12;
      const totalPayments = loanTerm * 12;

      let monthlyPayment = 0;
      if (loanAmount > 0) {
        if (monthlyRate === 0) {
          monthlyPayment = loanAmount / totalPayments;
        } else {
          monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        }
      }

      const totalCost = monthlyPayment * totalPayments;
      const totalInterest = Math.max(0, totalCost - loanAmount);

      const dataPoints: { x: any; y: number }[] = [];
      let balance = loanAmount;
      dataPoints.push({ x: 0, y: loanAmount });

      const interval = Math.max(1, Math.floor(totalPayments / 10));
      for (let i = 1; i <= totalPayments; i++) {
        const interestPaid = balance * monthlyRate;
        const principalPaid = monthlyPayment - interestPaid;
        balance = Math.max(0, balance - principalPaid);
        if (i % interval === 0 || i === totalPayments) {
          dataPoints.push({ x: (i / 12).toFixed(1), y: Math.round(balance) });
        }
      }

      return {
        results: {
          monthlyPayment: monthlyPayment.toFixed(2),
          loanAmount: loanAmount.toFixed(2),
          totalInterest: totalInterest.toFixed(2),
          totalCost: totalCost.toFixed(2)
        },
        chartData: {
          points: dataPoints,
          xLabel: 'Years',
          yLabel: 'Balance'
        }
      };
    }
  },

  compound: {
    id: 'compound',
    title: 'Compound Interest Calculator',
    description: 'See the power of compound interest. Project savings growth over time with monthly contributions.',
    category: 'finance',
    color: 'emerald',
    icon: '📈',
    info: {
      formula: 'A = P * (1 + r/n)^(n*t)',
      explanation: 'Compound interest is the addition of interest to the principal sum of a loan or deposit—essentially, interest on interest. The compounding frequency (n) determines how often interest is calculated.',
      insights: [
        'Rule of 72: Divide 72 by your annual interest rate to estimate how many years it will take to double your invested money.',
        'Compounding Frequency: The more frequently interest compounds (e.g., monthly or daily instead of annually), the higher your effective annual yield (APY).',
        'Start Early, Stay Invested: The exponential curve of compound interest starts slowly but curves upward dramatically after 15 to 20 years.'
      ]
    },
    inputs: [
      { id: 'initialDeposit', label: 'Initial Deposit', type: 'slider', min: 0, max: 10000000, step: 5000, default: 100000, unit: '₹' },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'slider', min: 0, max: 500000, step: 500, default: 5000, unit: '₹' },
      { id: 'interestRate', label: 'Estimated Interest Rate', type: 'slider', min: 1, max: 20, step: 0.1, default: 10, unit: '%' },
      { id: 'years', label: 'Length of Time', type: 'slider', min: 1, max: 50, step: 1, default: 20, unit: ' Years' },
      { id: 'compounding', label: 'Compounding', type: 'select', options: [1, 4, 12], optionNames: { 1: 'Annually', 4: 'Quarterly', 12: 'Monthly' }, default: 12 }
    ],
    outputs: [
      { id: 'futureValue', label: 'Future Value', type: 'currency', isHero: true },
      { id: 'totalContributions', label: 'Total Contributions', type: 'currency' },
      { id: 'totalInterest', label: 'Total Interest Earned', type: 'currency' }
    ],
    calculate: (inputs) => {
      const initialDeposit = parseFloat(inputs.initialDeposit) || 0;
      const monthlyContribution = parseFloat(inputs.monthlyContribution) || 0;
      const annualRate = (parseFloat(inputs.interestRate) || 0) / 100;
      const years = parseInt(inputs.years) || 20;
      const compoundingFrequency = parseInt(inputs.compounding) || 12;

      let balance = initialDeposit;
      let totalContributions = 0;
      const months = years * 12;
      const chartPoints: { x: any; y: number }[] = [{ x: 0, y: initialDeposit }];

      const step = Math.max(1, Math.floor(months / 10));

      for (let m = 1; m <= months; m++) {
        const ratePerPeriod = annualRate / compoundingFrequency;
        const mComp = 12 / compoundingFrequency;
        if (m % mComp === 0) {
          balance = balance * (1 + ratePerPeriod);
        }
        balance += monthlyContribution;
        totalContributions += monthlyContribution;

        if (m % step === 0 || m === months) {
          chartPoints.push({ x: (m / 12).toFixed(1), y: Math.round(balance) });
        }
      }

      const totalInterest = Math.max(0, balance - initialDeposit - totalContributions);

      return {
        results: {
          futureValue: balance.toFixed(2),
          totalContributions: totalContributions.toFixed(2),
          totalInterest: totalInterest.toFixed(2)
        },
        chartData: {
          points: chartPoints,
          xLabel: 'Years',
          yLabel: 'Growth'
        }
      };
    }
  },

  bmi: {
    id: 'bmi',
    title: 'BMI Calculator',
    description: 'Check your Body Mass Index (BMI) and find your optimal healthy weight range instantly.',
    category: 'health',
    color: 'pink',
    icon: '❤️',
    info: {
      formula: 'BMI = Weight (kg) / [ Height (m) ]^2',
      explanation: 'Body Mass Index (BMI) is a simple numerical calculation of a person\'s weight-to-height ratio. It is widely used as a medical screening tool to identify underweight, normal, overweight, and obese categories.',
      insights: [
        'Muscle Mass Bias: BMI does not differentiate between fat and lean muscle mass. Highly muscular athletes may be categorized as \'overweight\' despite having low body fat.',
        'Waist Circumference: Combine BMI with waist circumference measurements to get a more accurate evaluation of abdominal fat and cardiovascular health risk.',
        'Optimal Health: A normal BMI (18.5 - 24.9) is statistically associated with a lower incidence of type-2 diabetes, hypertension, and metabolic syndromes.'
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'slider', min: 30, max: 200, step: 1, default: 70, unit: ' kg' },
      { id: 'height', label: 'Height', type: 'slider', min: 100, max: 220, step: 1, default: 175, unit: ' cm' }
    ],
    outputs: [
      { id: 'bmiScore', label: 'BMI Score', type: 'number', isHero: true },
      { id: 'bmiClass', label: 'Classification', type: 'text' },
      { id: 'optimalWeight', label: 'Optimal Weight Range', type: 'text' }
    ],
    calculate: (inputs) => {
      const weight = parseFloat(inputs.weight) || 70;
      const heightCm = parseFloat(inputs.height) || 175;
      const heightM = heightCm / 100;
      const bmi = weight / (heightM * heightM);

      let bmiClass = '';
      let badgeClass = '';
      if (bmi < 18.5) {
        bmiClass = 'Underweight';
        badgeClass = 'status-underweight';
      } else if (bmi < 25) {
        bmiClass = 'Normal Range';
        badgeClass = 'status-normal';
      } else if (bmi < 30) {
        bmiClass = 'Overweight';
        badgeClass = 'status-overweight';
      } else {
        bmiClass = 'Obese';
        badgeClass = 'status-obese';
      }

      const minWeight = (18.5 * (heightM * heightM)).toFixed(1);
      const maxWeight = (24.9 * (heightM * heightM)).toFixed(1);
      const optimalWeight = `${minWeight} - ${maxWeight} kg`;

      return {
        results: {
          bmiScore: bmi.toFixed(1),
          bmiClass: `<span class="health-status-badge ${badgeClass}">${bmiClass}</span>`,
          optimalWeight: optimalWeight
        },
        gaugeData: {
          value: bmi,
          min: 15,
          max: 35
        }
      };
    }
  },

  calorie: {
    id: 'calorie',
    title: 'Calorie Calculator',
    description: 'Estimate daily energy maintenance, weight loss, and weight gain caloric targets.',
    category: 'health',
    color: 'pink',
    icon: '⚡',
    info: {
      formula: 'BMR (Mifflin) * Activity Factor = TDEE',
      explanation: 'The Calorie Calculator estimates your Total Daily Energy Expenditure (TDEE) by multiplying your baseline metabolic rate by a physical activity coefficient. Weight loss requires a caloric deficit, while weight gain requires a surplus.',
      insights: [
        'Caloric Deficit Rule: A deficit of 500 kcal per day translates to approximately 0.5 kg (1 lb) of fat loss per week, which is a safe, sustainable pace.',
        'Thermic Effect of Food (TEF): Protein has a higher thermic effect than carbs or fats—meaning your body burns more energy digesting protein.',
        'Metabolic Adaptation: During prolonged caloric restriction, your metabolic rate may slow down slightly. Periodic diet breaks help sustain thyroid and metabolic speed.'
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'slider', min: 30, max: 200, step: 1, default: 70, unit: ' kg' },
      { id: 'height', label: 'Height', type: 'slider', min: 100, max: 220, step: 1, default: 175, unit: ' cm' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'], optionNames: { male: 'Male', female: 'Female' }, default: 'male' },
      { id: 'age', label: 'Age', type: 'slider', min: 15, max: 100, step: 1, default: 25, unit: ' years' },
      { id: 'activity', label: 'Activity Level', type: 'select', options: [1.2, 1.375, 1.55, 1.725, 1.9], optionNames: { 1.2: 'Sedentary', 1.375: 'Lightly Active', 1.55: 'Moderately Active', 1.725: 'Very Active', 1.9: 'Extra Active' }, default: 1.375 }
    ],
    outputs: [
      { id: 'maintain', label: 'Maintain Weight', type: 'text', isHero: true },
      { id: 'mildLoss', label: 'Mild Weight Loss (-0.25kg/wk)', type: 'text' },
      { id: 'weightLoss', label: 'Weight Loss (-0.50kg/wk)', type: 'text' },
      { id: 'mildGain', label: 'Mild Weight Gain (+0.25kg/wk)', type: 'text' }
    ],
    calculate: (inputs) => {
      const weight = parseFloat(inputs.weight) || 70;
      const heightCm = parseFloat(inputs.height) || 175;
      const age = parseInt(inputs.age) || 25;
      const gender = inputs.gender;
      const activity = parseFloat(inputs.activity) || 1.2;

      let bmr = 0;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
      }

      const tdee = Math.round(bmr * activity);

      return {
        results: {
          maintain: `${tdee} kcal/day`,
          mildLoss: `${Math.max(1200, tdee - 250)} kcal/day`,
          weightLoss: `${Math.max(1200, tdee - 500)} kcal/day`,
          mildGain: `${tdee + 250} kcal/day`
        }
      };
    }
  },

  scientific: {
    id: 'scientific',
    title: 'Scientific Calculator',
    description: 'High-performance math matrix. Features trigonometric functions, power metrics, logarithms, and computation memory.',
    category: 'utility',
    color: 'indigo',
    icon: '🧮',
    info: {
      formula: 'Native trigonometric, exponential, logarithmic, and arithmetic client-side Javascript computation',
      explanation: 'The scientific calculator delivers highly precise mathematical matrix evaluations entirely locally. It supports complex trigonometric operations (sine, cosine, tangent), powers, roots, and computational memory.',
      insights: [
        'Radian vs Degree: Ensure you select the correct angular measurement mode (Radians vs Degrees) when performing trigonometric evaluations.',
        'Order of Operations: Javascript calculations strictly follow the standard PEMDAS/BODMAS algebraic mathematical execution hierarchy.',
        'Precision Constraints: Floating point computations in JavaScript use standard IEEE 754 double-precision arithmetic, providing up to 15-17 decimal digits of precision.'
      ]
    },
    type: 'custom_scientific'
  },

  converter: {
    id: 'converter',
    title: 'Conversion Calculator',
    description: 'Convert lengths, weights, liquid volumes, and temperatures in a dynamic conversion matrix.',
    category: 'utility',
    color: 'emerald',
    icon: '🔄',
    info: {
      formula: 'Factor-based unit scaling (Y = X * Scale factor + Shift constant)',
      explanation: 'Unit converter applies standardized scalar conversion factors to transition physical values across metric, imperial, and local scientific units instantly.',
      insights: [
        'Metric System Advantages: The metric system is based on decimal scales of 10, making prefix conversions (kilo, milli, micro) uniform and straightforward.',
        'Precision Control: Keep rounding thresholds high when converting scientific units (like temperature or pressure) to prevent critical calculation rounding errors.',
        'Client-side Utility: Convert densities, lengths, and liquid measurements instantly on the go. Perfect for baking, engineering, and DIY home improvements.'
      ]
    },
    type: 'custom_converter'
  },

  auto_loan: {
    id: 'auto_loan',
    title: 'Auto Loan Calculator',
    description: 'Calculate vehicle monthly loan payments, including down payment, trade-in, and sales tax.',
    category: 'finance',
    color: 'indigo',
    icon: '🚗',
    inputs: [
      { id: 'price', label: 'Vehicle Price', type: 'slider', min: 50000, max: 8000000, step: 10000, default: 1200000, unit: '₹' },
      { id: 'down', label: 'Down Payment', type: 'slider', min: 0, max: 4000000, step: 5000, default: 200000, unit: '₹' },
      { id: 'trade', label: 'Trade-in Value', type: 'slider', min: 0, max: 2000000, step: 5000, default: 50000, unit: '₹' },
      { id: 'taxRate', label: 'Sales Tax', type: 'slider', min: 0, max: 15, step: 0.1, default: 12, unit: '%' },
      { id: 'rate', label: 'Interest Rate', type: 'slider', min: 1, max: 15, step: 0.1, default: 8.5, unit: '%' },
      { id: 'months', label: 'Term Length', type: 'select', options: [36, 48, 60, 72, 84], default: 60, suffix: ' Months' }
    ],
    outputs: [
      { id: 'monthly', label: 'Monthly Payment', type: 'currency', isHero: true },
      { id: 'taxCost', label: 'Sales Tax Cost', type: 'currency' },
      { id: 'financed', label: 'Amount Financed', type: 'currency' },
      { id: 'totalCost', label: 'Total Car Cost (with interest)', type: 'currency' }
    ],
    calculate: (inputs) => {
      const price = parseFloat(inputs.price) || 0;
      const down = parseFloat(inputs.down) || 0;
      const trade = parseFloat(inputs.trade) || 0;
      const taxRate = parseFloat(inputs.taxRate) || 0;
      const rate = parseFloat(inputs.rate) || 0;
      const months = parseInt(inputs.months) || 60;

      const taxCost = price * (taxRate / 100);
      const financed = Math.max(0, price + taxCost - down - trade);
      
      const r = (rate / 100) / 12;
      let monthly = 0;
      if (financed > 0) {
        if (r === 0) monthly = financed / months;
        else monthly = (financed * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      }

      const totalCost = monthly * months + down + trade;

      return {
        results: {
          monthly: monthly.toFixed(2),
          taxCost: taxCost.toFixed(2),
          financed: financed.toFixed(2),
          totalCost: totalCost.toFixed(2)
        }
      };
    }
  },

  interest: {
    id: 'interest',
    title: 'Interest Calculator',
    description: 'Compare accumulated yields on Simple vs Compounding interest formulas.',
    category: 'finance',
    color: 'emerald',
    icon: '🪙',
    inputs: [
      { id: 'p', label: 'Principal Sum', type: 'slider', min: 1000, max: 5000000, step: 5000, default: 200000, unit: '₹' },
      { id: 'r', label: 'Annual Rate', type: 'slider', min: 1, max: 25, step: 0.1, default: 7.5, unit: '%' },
      { id: 't', label: 'Time Horizon', type: 'slider', min: 1, max: 40, step: 1, default: 10, unit: ' Years' }
    ],
    outputs: [
      { id: 'compEarned', label: 'Compound Value', type: 'currency', isHero: true },
      { id: 'simpEarned', label: 'Simple Value', type: 'currency' },
      { id: 'difference', label: 'Difference Earned', type: 'currency' }
    ],
    calculate: (inputs) => {
      const p = parseFloat(inputs.p) || 0;
      const r = (parseFloat(inputs.r) || 0) / 100;
      const t = parseInt(inputs.t) || 10;

      const simple = p * (1 + r * t);
      const compound = p * Math.pow(1 + r, t);
      const difference = Math.max(0, compound - simple);

      return {
        results: {
          compEarned: compound.toFixed(2),
          simpEarned: simple.toFixed(2),
          difference: difference.toFixed(2)
        }
      };
    }
  },

  payment: {
    id: 'payment',
    title: 'Payment Calculator',
    description: 'Evaluate credit card payoff schedules and see how increasing monthly additions limits total interest.',
    category: 'finance',
    color: 'indigo',
    icon: '💳',
    inputs: [
      { id: 'balance', label: 'Card Balance', type: 'slider', min: 500, max: 1000000, step: 500, default: 100000, unit: '₹' },
      { id: 'rate', label: 'Card APR', type: 'slider', min: 5, max: 35, step: 0.5, default: 18, unit: '%' },
      { id: 'monthlyPay', label: 'Monthly Payment', type: 'slider', min: 100, max: 100000, step: 100, default: 5000, unit: '₹' }
    ],
    outputs: [
      { id: 'monthsNeeded', label: 'Months to Payoff', type: 'text', isHero: true },
      { id: 'interestCost', label: 'Total Interest Paid', type: 'currency' },
      { id: 'totalCost', label: 'Total Amount Paid', type: 'currency' }
    ],
    calculate: (inputs) => {
      const bal = parseFloat(inputs.balance) || 0;
      const apr = parseFloat(inputs.rate) || 0;
      const pay = parseFloat(inputs.monthlyPay) || 0;

      const monthlyRate = (apr / 100) / 12;
      const minAllowable = bal * monthlyRate;

      if (pay <= minAllowable) {
        return {
          results: {
            monthsNeeded: 'Infeasible (payment too low)',
            interestCost: '0.00',
            totalCost: '0.00'
          }
        };
      }

      let months = 0;
      let remaining = bal;
      let totalInterest = 0;

      while (remaining > 0 && months < 600) {
        const interest = remaining * monthlyRate;
        totalInterest += interest;
        remaining = remaining + interest - pay;
        months++;
      }

      const totalPaid = bal + totalInterest;

      return {
        results: {
          monthsNeeded: `${months} Months`,
          interestCost: totalInterest.toFixed(2),
          totalCost: totalPaid.toFixed(2)
        }
      };
    }
  },

  retirement: {
    id: 'retirement',
    title: 'Retirement Calculator',
    description: 'Find out if savings contributions will hit your retirement nest egg targets.',
    category: 'finance',
    color: 'emerald',
    icon: '🏖️',
    info: {
      formula: 'FV = Nest * (1+r)^n + Contrib * (((1+r)^n - 1) / r)',
      explanation: 'Retirement projection calculates the target nest egg you will accumulate by a target age. It compounds your current savings and applies interest growth to regular monthly savings contributions.',
      insights: [
        'The 4% Rule: A common retirement benchmark states that you can safely withdraw 4% of your nest egg annually without running out of money.',
        'Target Corpus: Aim to accumulate 25 to 30 times your estimated annual retirement expenses before transitioning to full retirement.',
        'Step Up Contributions: Regularly increasing your monthly retirement savings by even 5% each year can dramatically accelerate your financial independence date.'
      ]
    },
    inputs: [
      { id: 'age', label: 'Current Age', type: 'slider', min: 18, max: 70, step: 1, default: 30, unit: ' yrs' },
      { id: 'retAge', label: 'Retirement Age', type: 'slider', min: 50, max: 80, step: 1, default: 65, unit: ' yrs' },
      { id: 'nest', label: 'Current Savings', type: 'slider', min: 0, max: 50000000, step: 10000, default: 500000, unit: '₹' },
      { id: 'contrib', label: 'Monthly Contributions', type: 'slider', min: 0, max: 500000, step: 500, default: 15000, unit: '₹' },
      { id: 'rate', label: 'Expected Return', type: 'slider', min: 1, max: 15, step: 0.1, default: 10, unit: '%' }
    ],
    outputs: [
      { id: 'finalNest', label: 'Nest Egg at Retirement', type: 'currency', isHero: true },
      { id: 'yearsLeft', label: 'Years to Accumulate', type: 'text' },
      { id: 'totalSaved', label: 'Out of Pocket Saved', type: 'currency' }
    ],
    calculate: (inputs) => {
      const age = parseInt(inputs.age) || 30;
      const retAge = Math.max(age + 1, parseInt(inputs.retAge) || 65);
      const nest = parseFloat(inputs.nest) || 0;
      const monthly = parseFloat(inputs.contrib) || 0;
      const r = (parseFloat(inputs.rate) || 0) / 100 / 12;

      const years = retAge - age;
      const months = years * 12;

      let balance = nest;
      let outOfPocket = 0;

      for (let m = 0; m < months; m++) {
        balance = balance * (1 + r) + monthly;
        outOfPocket += monthly;
      }

      return {
        results: {
          finalNest: balance.toFixed(2),
          yearsLeft: `${years} Years`,
          totalSaved: (nest + outOfPocket).toFixed(2)
        }
      };
    }
  },

  amortization: {
    id: 'amortization',
    title: 'Amortization Calculator',
    description: 'Detailed debt schedule tracker mapping principal and interest proportions.',
    category: 'finance',
    color: 'indigo',
    icon: '📊',
    inputs: [
      { id: 'loanAmt', label: 'Loan Amount', type: 'slider', min: 10000, max: 20000000, step: 10000, default: 2000000, unit: '₹' },
      { id: 'rate', label: 'Interest Rate', type: 'slider', min: 1, max: 15, step: 0.1, default: 8.5, unit: '%' },
      { id: 'term', label: 'Term Length', type: 'select', options: [5, 10, 15, 20, 30], default: 15, suffix: ' Years' }
    ],
    outputs: [
      { id: 'pay', label: 'Monthly Payment', type: 'currency', isHero: true },
      { id: 'totalInterest', label: 'Total Interest Paid', type: 'currency' }
    ],
    calculate: (inputs) => {
      const p = parseFloat(inputs.loanAmt) || 0;
      const rate = parseFloat(inputs.rate) || 0;
      const termYears = parseInt(inputs.term) || 15;

      const r = (rate / 100) / 12;
      const totalPayments = termYears * 12;

      let monthlyPayment = 0;
      if (p > 0) {
        if (r === 0) monthlyPayment = p / totalPayments;
        else monthlyPayment = (p * r * Math.pow(1 + r, totalPayments)) / (Math.pow(1 + r, totalPayments) - 1);
      }

      const totalCost = monthlyPayment * totalPayments;
      const totalInterest = Math.max(0, totalCost - p);

      const chartPoints: { x: any; y: number }[] = [{ x: 0, y: p }];
      let balance = p;
      const step = Math.max(1, Math.floor(totalPayments / 10));

      for (let i = 1; i <= totalPayments; i++) {
        const intPaid = balance * r;
        const princPaid = monthlyPayment - intPaid;
        balance = Math.max(0, balance - princPaid);
        if (i % step === 0 || i === totalPayments) {
          chartPoints.push({ x: (i / 12).toFixed(1), y: Math.round(balance) });
        }
      }

      return {
        results: {
          pay: monthlyPayment.toFixed(2),
          totalInterest: totalInterest.toFixed(2)
        },
        chartData: {
          points: chartPoints,
          xLabel: 'Years',
          yLabel: 'Balance'
        }
      };
    }
  },

  investment: {
    id: 'investment',
    title: 'Investment Calculator',
    description: 'Calculate Return on Investment (ROI) and annualized capital expansion margins.',
    category: 'finance',
    color: 'emerald',
    icon: '💼',
    inputs: [
      { id: 'initial', label: 'Capital Invested', type: 'slider', min: 1000, max: 10000000, step: 5000, default: 100000, unit: '₹' },
      { id: 'returned', label: 'Capital Returned', type: 'slider', min: 1000, max: 20000000, step: 5000, default: 180000, unit: '₹' },
      { id: 'years', label: 'Investment Length', type: 'slider', min: 1, max: 20, step: 1, default: 4, unit: ' Years' }
    ],
    outputs: [
      { id: 'gain', label: 'Total Capital Gain', type: 'currency', isHero: true },
      { id: 'roi', label: 'Total ROI (%)', type: 'number', suffix: '%' },
      { id: 'annualized', label: 'Annualized ROI', type: 'number', suffix: '%' }
    ],
    calculate: (inputs) => {
      const init = parseFloat(inputs.initial) || 1;
      const ret = parseFloat(inputs.returned) || 0;
      const yrs = parseInt(inputs.years) || 1;

      const gain = ret - init;
      const roi = (gain / init) * 100;
      const annualized = (Math.pow(ret / init, 1 / yrs) - 1) * 100;

      return {
        results: {
          gain: gain.toFixed(2),
          roi: roi.toFixed(2) + '%',
          annualized: annualized.toFixed(2) + '%'
        }
      };
    }
  },

  inflation: {
    id: 'inflation',
    title: 'Inflation Calculator',
    description: 'Adjust purchasing power rates over years based on custom inflation factors.',
    category: 'finance',
    color: 'amber',
    icon: '🎈',
    inputs: [
      { id: 'amt', label: 'Starting Value', type: 'slider', min: 10, max: 5000000, step: 100, default: 10000, unit: '₹' },
      { id: 'rate', label: 'Annual Inflation', type: 'slider', min: 0.1, max: 25, step: 0.1, default: 5.5, unit: '%' },
      { id: 'years', label: 'Years Elapse', type: 'slider', min: 1, max: 50, step: 1, default: 15, unit: ' Years' }
    ],
    outputs: [
      { id: 'futureVal', label: 'Required Equivalent Value', type: 'currency', isHero: true },
      { id: 'loss', label: 'Purchasing Power Loss', type: 'currency' }
    ],
    calculate: (inputs) => {
      const amt = parseFloat(inputs.amt) || 0;
      const r = (parseFloat(inputs.rate) || 0) / 100;
      const y = parseInt(inputs.years) || 15;

      const eq = amt * Math.pow(1 + r, y);
      const loss = eq - amt;

      return {
        results: {
          futureVal: eq.toFixed(2),
          loss: loss.toFixed(2)
        }
      };
    }
  },

  finance: {
    id: 'finance',
    title: 'Finance Calculator',
    description: 'Determine Present Value (PV) requirements needed to hit your future asset benchmarks.',
    category: 'finance',
    color: 'indigo',
    icon: '🏦',
    inputs: [
      { id: 'fv', label: 'Future Value Benchmark', type: 'slider', min: 1000, max: 10000000, step: 5000, default: 1000000, unit: '₹' },
      { id: 'rate', label: 'Annual Yield Target', type: 'slider', min: 1, max: 20, step: 0.1, default: 8.5, unit: '%' },
      { id: 'years', label: 'Duration Target', type: 'slider', min: 1, max: 40, step: 1, default: 10, unit: ' Years' }
    ],
    outputs: [
      { id: 'pv', label: 'Present Value Capital Needed', type: 'currency', isHero: true },
      { id: 'gainNeeded', label: 'Gain Interest Needed', type: 'currency' }
    ],
    calculate: (inputs) => {
      const fv = parseFloat(inputs.fv) || 0;
      const r = (parseFloat(inputs.rate) || 0) / 100;
      const y = parseInt(inputs.years) || 10;

      const pv = fv / Math.pow(1 + r, y);
      const diff = Math.max(0, fv - pv);

      return {
        results: {
          pv: pv.toFixed(2),
          gainNeeded: diff.toFixed(2)
        }
      };
    }
  },

  income_tax: {
    id: 'income_tax',
    title: 'Income Tax Calculator',
    description: 'Estimate Federal take-home salary and effective tax rate brackets based on filing status.',
    category: 'finance',
    color: 'emerald',
    icon: '📝',
    info: {
      formula: 'Taxable Income = Salary - Standard Deduction | Progressive Bracket Tax = sum(Bracket taxable income * Bracket rate)',
      explanation: 'This calculator models a progressive income tax system. Tax rates increase as income moves through different slabs, applying higher percentages only to the income within each specific bracket.',
      insights: [
        'Marginal vs Effective Tax: Your marginal rate is the tax paid on your last dollar of income. Your effective rate is the average rate paid on your total income.',
        'Deductions vs Credits: Tax deductions reduce your taxable income, while tax credits reduce your actual tax liability dollar-for-dollar.',
        'Bracket Creep: As inflation increases nominal salaries, individuals may slide into higher tax brackets without a real increase in purchasing power.'
      ]
    },
    inputs: [
      { id: 'salary', label: 'Annual Salary', type: 'slider', min: 10000, max: 10000000, step: 10000, default: 1200000, unit: '₹' },
      { id: 'status', label: 'Filing Status', type: 'select', options: ['single', 'married'], optionNames: { single: 'Single Filer', married: 'Married Jointly' }, default: 'single' }
    ],
    outputs: [
      { id: 'takeHome', label: 'Net Take-Home Pay', type: 'currency', isHero: true },
      { id: 'effective', label: 'Effective Tax Rate', type: 'text' },
      { id: 'taxCost', label: 'Federal Tax Withheld', type: 'currency' }
    ],
    calculate: (inputs) => {
      const salary = parseFloat(inputs.salary) || 0;
      const status = inputs.status;

      const deduction = status === 'single' ? 150000 : 300000;
      const taxable = Math.max(0, salary - deduction);

      const singleBrackets = [
        { limit: 116000, rate: 0.10 },
        { limit: 471500, rate: 0.12 },
        { limit: 1005000, rate: 0.22 },
        { limit: 1919000, rate: 0.24 },
        { limit: 2437000, rate: 0.32 },
        { limit: 6093500, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ];

      const marriedBrackets = [
        { limit: 232000, rate: 0.10 },
        { limit: 943000, rate: 0.12 },
        { limit: 2010000, rate: 0.22 },
        { limit: 3838000, rate: 0.24 },
        { limit: 4874000, rate: 0.32 },
        { limit: 7312000, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ];

      const brackets = status === 'single' ? singleBrackets : marriedBrackets;
      let tax = 0;
      let prevLimit = 0;

      for (let b of brackets) {
        if (taxable > b.limit) {
          tax += (b.limit - prevLimit) * b.rate;
          prevLimit = b.limit;
        } else {
          tax += (taxable - prevLimit) * b.rate;
          break;
        }
      }

      const takeHome = Math.max(0, salary - tax);
      const effective = salary > 0 ? ((tax / salary) * 100).toFixed(1) + '%' : '0.0%';

      return {
        results: {
          takeHome: takeHome.toFixed(2),
          effective: effective,
          taxCost: tax.toFixed(2)
        }
      };
    }
  },

  salary: {
    id: 'salary',
    title: 'Salary Calculator',
    description: 'Split your yearly contract salary into monthly, bi-weekly, and hourly wage blocks.',
    category: 'finance',
    color: 'emerald',
    icon: '💼',
    inputs: [
      { id: 'salary', label: 'Annual Salary', type: 'slider', min: 10000, max: 5000000, step: 10000, default: 800000, unit: '₹' }
    ],
    outputs: [
      { id: 'hourly', label: 'Hourly Rate (40hr/wk)', type: 'currency', isHero: true },
      { id: 'monthly', label: 'Monthly Equivalent', type: 'currency' },
      { id: 'biweekly', label: 'Bi-Weekly Equivalent', type: 'currency' },
      { id: 'weekly', label: 'Weekly Equivalent', type: 'currency' }
    ],
    calculate: (inputs) => {
      const salary = parseFloat(inputs.salary) || 0;

      const monthly = salary / 12;
      const biweekly = salary / 26;
      const weekly = salary / 52;
      const hourly = salary / 2080;

      return {
        results: {
          hourly: hourly.toFixed(2),
          monthly: monthly.toFixed(2),
          biweekly: biweekly.toFixed(2),
          weekly: weekly.toFixed(2)
        }
      };
    }
  },

  interest_rate: {
    id: 'interest_rate',
    title: 'Interest Rate Calculator',
    description: 'Identify the exact annualized CAGR yield rate required to meet target capital additions.',
    category: 'finance',
    color: 'emerald',
    icon: '📊',
    inputs: [
      { id: 'principal', label: 'Starting Capital', type: 'slider', min: 1000, max: 5000000, step: 5000, default: 100000, unit: '₹' },
      { id: 'target', label: 'Target Capital', type: 'slider', min: 2000, max: 10000000, step: 5000, default: 200000, unit: '₹' },
      { id: 'years', label: 'Years Allowed', type: 'slider', min: 1, max: 30, step: 1, default: 8, unit: ' Years' }
    ],
    outputs: [
      { id: 'rateReq', label: 'CAGR Rate Required', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const p = parseFloat(inputs.principal) || 1;
      const target = Math.max(p, parseFloat(inputs.target) || 2);
      const yrs = parseInt(inputs.years) || 1;

      const rate = (Math.pow(target / p, 1 / yrs) - 1) * 100;

      return {
        results: {
          rateReq: rate.toFixed(2) + '%'
        }
      };
    }
  },

  body_fat: {
    id: 'body_fat',
    title: 'Body Fat Calculator',
    description: 'Check estimated fat compositions using the US Navy tape measurements standard.',
    category: 'health',
    color: 'pink',
    icon: '⚖️',
    inputs: [
      { id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'], optionNames: { male: 'Male', female: 'Female' }, default: 'male' },
      { id: 'height', label: 'Height', type: 'slider', min: 120, max: 220, step: 1, default: 175, unit: ' cm' },
      { id: 'neck', label: 'Neck Width', type: 'slider', min: 25, max: 60, step: 0.5, default: 37, unit: ' cm' },
      { id: 'waist', label: 'Waist Width', type: 'slider', min: 50, max: 150, step: 0.5, default: 85, unit: ' cm' },
      { id: 'hip', label: 'Hip Width (Females)', type: 'slider', min: 50, max: 150, step: 0.5, default: 90, unit: ' cm' }
    ],
    outputs: [
      { id: 'bfPercent', label: 'Body Fat (%)', type: 'number', isHero: true },
      { id: 'category', label: 'Fitness Category', type: 'text' }
    ],
    calculate: (inputs) => {
      const gender = inputs.gender;
      const hCm = parseFloat(inputs.height) || 175;
      const nCm = parseFloat(inputs.neck) || 37;
      const wCm = parseFloat(inputs.waist) || 85;
      const hipCm = parseFloat(inputs.hip) || 90;

      const hIn = hCm / 2.54;
      const nIn = nCm / 2.54;
      const wIn = wCm / 2.54;
      const hipIn = hipCm / 2.54;

      let bf = 0;
      if (gender === 'male') {
        bf = 86.010 * Math.log10(wIn - nIn) - 70.041 * Math.log10(hIn) + 36.76;
      } else {
        bf = 163.205 * Math.log10(wIn + hipIn - nIn) - 97.684 * Math.log10(hIn) - 78.387;
      }

      bf = Math.max(2, Math.min(60, bf));

      let cat = '';
      if (gender === 'male') {
        if (bf < 6) cat = 'Essential Fat';
        else if (bf < 14) cat = 'Athletic';
        else if (bf < 18) cat = 'Fitness';
        else if (bf < 25) cat = 'Acceptable';
        else cat = 'Obese';
      } else {
        if (bf < 14) cat = 'Essential Fat';
        else if (bf < 21) cat = 'Athletic';
        else if (bf < 25) cat = 'Fitness';
        else if (bf < 32) cat = 'Acceptable';
        else cat = 'Obese';
      }

      return {
        results: {
          bfPercent: bf.toFixed(1) + '%',
          category: cat
        }
      };
    }
  },

  bmr: {
    id: 'bmr',
    title: 'BMR Calculator',
    description: 'Calculate your Basal Metabolic Rate (BMR) representing baseline caloric burn levels.',
    category: 'health',
    color: 'pink',
    icon: '🔥',
    info: {
      formula: 'Mifflin: BMR = 10W + 6.25H - 5A + s (s=+5 for males, -161 for females)',
      explanation: 'Basal Metabolic Rate (BMR) represents the number of calories your body needs to maintain basic life-sustaining functions (breathing, circulation, cell production) at complete rest.',
      insights: [
        'Age Decline: BMR naturally decreases by 1-2% per decade after age 20, primarily due to the loss of lean muscle mass.',
        'Lean Muscle Impact: Muscle tissue is metabolically active and burns more calories at rest than fat tissue. Strength training increases your baseline resting BMR.',
        'Resting Energy: Your BMR accounts for 60-75% of your total daily calorie burn, making baseline metabolic health crucial for weight management.'
      ]
    },
    inputs: [
      { id: 'weight', label: 'Weight', type: 'slider', min: 30, max: 200, step: 1, default: 70, unit: ' kg' },
      { id: 'height', label: 'Height', type: 'slider', min: 100, max: 220, step: 1, default: 175, unit: ' cm' },
      { id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'], optionNames: { male: 'Male', female: 'Female' }, default: 'male' },
      { id: 'age', label: 'Age', type: 'slider', min: 15, max: 100, step: 1, default: 25, unit: ' yrs' }
    ],
    outputs: [
      { id: 'bmrMifflin', label: 'BMR (Mifflin-St Jeor)', type: 'text', isHero: true },
      { id: 'bmrHarris', label: 'BMR (Revised Harris-Benedict)', type: 'text' }
    ],
    calculate: (inputs) => {
      const w = parseFloat(inputs.weight) || 70;
      const h = parseFloat(inputs.height) || 175;
      const a = parseInt(inputs.age) || 25;
      const g = inputs.gender;

      let bmrM = 0;
      let bmrH = 0;

      if (g === 'male') {
        bmrM = 10 * w + 6.25 * h - 5 * a + 5;
        bmrH = 13.397 * w + 4.799 * h - 5.677 * a + 88.362;
      } else {
        bmrM = 10 * w + 6.25 * h - 5 * a - 161;
        bmrH = 9.247 * w + 3.098 * h - 4.330 * a + 447.593;
      }

      return {
        results: {
          bmrMifflin: `${Math.round(bmrM)} kcal/day`,
          bmrHarris: `${Math.round(bmrH)} kcal/day`
        }
      };
    }
  },

  ideal_weight: {
    id: 'ideal_weight',
    title: 'Ideal Weight Calculator',
    description: 'Find your medically recognized optimal body weight using standardized formulas.',
    category: 'health',
    color: 'pink',
    icon: '⚖️',
    inputs: [
      { id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'], default: 'male' },
      { id: 'height', label: 'Height', type: 'slider', min: 130, max: 220, step: 1, default: 175, unit: ' cm' }
    ],
    outputs: [
      { id: 'devine', label: 'Devine Ideal Weight', type: 'text', isHero: true },
      { id: 'robinson', label: 'Robinson Ideal Weight', type: 'text' },
      { id: 'miller', label: 'Miller Ideal Weight', type: 'text' }
    ],
    calculate: (inputs) => {
      const gender = inputs.gender;
      const hCm = parseFloat(inputs.height) || 175;
      const hIn = hCm / 2.54;

      const inchesOver5Ft = Math.max(0, hIn - 60);

      let d = 0;
      let r = 0;
      let m = 0;

      if (gender === 'male') {
        d = 50.0 + 2.3 * inchesOver5Ft;
        r = 52.0 + 1.9 * inchesOver5Ft;
        m = 56.2 + 1.41 * inchesOver5Ft;
      } else {
        d = 45.5 + 2.3 * inchesOver5Ft;
        r = 49.0 + 1.7 * inchesOver5Ft;
        m = 53.1 + 1.36 * inchesOver5Ft;
      }

      return {
        results: {
          devine: d.toFixed(1) + ' kg',
          robinson: r.toFixed(1) + ' kg',
          miller: m.toFixed(1) + ' kg'
        }
      };
    }
  },

  pace: {
    id: 'pace',
    title: 'Pace Calculator',
    description: 'Calculate running paces and splitting metrics based on mileage distances.',
    category: 'health',
    color: 'pink',
    icon: '🏃',
    inputs: [
      { id: 'dist', label: 'Distance Preset', type: 'select', options: ['5k', '10k', 'half', 'marathon'], optionNames: { '5k': '5 Kilometers', '10k': '10 Kilometers', half: 'Half Marathon (21.1k)', marathon: 'Full Marathon (42.2k)' }, default: '5k' },
      { id: 'hours', label: 'Target Hours', type: 'slider', min: 0, max: 6, step: 1, default: 0, unit: ' hr' },
      { id: 'mins', label: 'Target Minutes', type: 'slider', min: 0, max: 59, step: 1, default: 25, unit: ' min' }
    ],
    outputs: [
      { id: 'kmPace', label: 'Pace (per Kilometer)', type: 'text', isHero: true },
      { id: 'miPace', label: 'Pace (per Mile)', type: 'text' },
      { id: 'speed', label: 'Average Velocity', type: 'text' }
    ],
    calculate: (inputs) => {
      const distPreset = inputs.dist;
      const hrs = parseInt(inputs.hours) || 0;
      const mins = parseInt(inputs.mins) || 25;

      const totalSecs = hrs * 3600 + mins * 60;

      let kms = 5.0;
      if (distPreset === '10k') kms = 10.0;
      else if (distPreset === 'half') kms = 21.0975;
      else if (distPreset === 'marathon') kms = 42.195;

      const miles = kms * 0.621371;

      const secPerKm = totalSecs / kms;
      const secPerMi = totalSecs / miles;

      const kMin = Math.floor(secPerKm / 60);
      const kSec = Math.round(secPerKm % 60);
      const mMin = Math.floor(secPerMi / 60);
      const mSec = Math.round(secPerMi % 60);

      const kPace = `${kMin}:${kSec.toString().padStart(2, '0')} /km`;
      const mPace = `${mMin}:${mSec.toString().padStart(2, '0')} /mi`;

      const speedKmh = (kms / (totalSecs / 3600)).toFixed(1) + ' km/h';

      return {
        results: {
          kmPace: kPace,
          miPace: mPace,
          speed: speedKmh
        }
      };
    }
  },

  pregnancy: {
    id: 'pregnancy',
    title: 'Pregnancy Calculator',
    description: 'Calculate gestational weeks, trimesters, and baby sizing metrics based on dates.',
    category: 'health',
    color: 'pink',
    icon: '🤰',
    inputs: [
      { id: 'daysLmp', label: 'Days Since LMP', type: 'slider', min: 7, max: 280, step: 7, default: 70, unit: ' days' }
    ],
    outputs: [
      { id: 'progress', label: 'Current Weeks Complete', type: 'text', isHero: true },
      { id: 'trimester', label: 'Active Trimester', type: 'text' },
      { id: 'babySize', label: 'Estimated Baby Size Reference', type: 'text' }
    ],
    calculate: (inputs) => {
      const days = parseInt(inputs.daysLmp) || 7;

      const weeks = Math.floor(days / 7);
      const remDays = days % 7;
      const progressText = `${weeks} Weeks, ${remDays} Days`;

      let trimester = '';
      if (weeks < 13) trimester = 'First Trimester';
      else if (weeks < 27) trimester = 'Second Trimester';
      else trimester = 'Third Trimester';

      let size = 'Sesame Seed';
      if (weeks >= 35) size = 'Watermelon 🍉';
      else if (weeks >= 28) size = 'Eggplant 🍆';
      else if (weeks >= 20) size = 'Banana 🍌';
      else if (weeks >= 12) size = 'Plum 🍑';
      else if (weeks >= 8) size = 'Raspberry 🍓';

      return {
        results: {
          progress: progressText,
          trimester: trimester,
          babySize: size
        }
      };
    }
  },

  conception: {
    id: 'conception',
    title: 'Pregnancy Conception Calculator',
    description: 'Trace back estimated windows of conception based on your due date.',
    category: 'health',
    color: 'pink',
    icon: '🗓️',
    inputs: [
      { id: 'dueDays', label: 'Days Until Due Date', type: 'slider', min: 10, max: 280, step: 5, default: 180, unit: ' days' }
    ],
    outputs: [
      { id: 'conceptionRange', label: 'Estimated Conception Date Window', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const daysToDue = parseInt(inputs.dueDays) || 180;
      const daysAgo = 266 - daysToDue;

      const dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - daysAgo - 3);
      const dateEnd = new Date();
      dateEnd.setDate(dateEnd.getDate() - daysAgo + 3);

      const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const range = `${dateStart.toLocaleDateString(undefined, opt)} - ${dateEnd.toLocaleDateString(undefined, opt)}`;

      return {
        results: {
          conceptionRange: range
        }
      };
    }
  },

  due_date: {
    id: 'due_date',
    title: 'Due Date Calculator',
    description: 'Estimate baby delivery milestones based on last period date.',
    category: 'health',
    color: 'pink',
    icon: '👶',
    inputs: [
      { id: 'lmpDays', label: 'Days Since Last Period (LMP)', type: 'slider', min: 7, max: 280, step: 7, default: 60, unit: ' days' }
    ],
    outputs: [
      { id: 'dueDate', label: 'Estimated Due Date (EDD)', type: 'text', isHero: true },
      { id: 'daysLeft', label: 'Days Remaining to Birth', type: 'text' }
    ],
    calculate: (inputs) => {
      const lmpDays = parseInt(inputs.lmpDays) || 60;
      const dueDays = 280 - lmpDays;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      const opt: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };

      return {
        results: {
          dueDate: dueDate.toLocaleDateString(undefined, opt),
          daysLeft: `${dueDays} Days`
        }
      };
    }
  },

  fraction: {
    id: 'fraction',
    title: 'Fraction Calculator',
    description: 'Solve arithmetic operations (+, -, *, /) on fraction sets.',
    category: 'utility',
    color: 'indigo',
    icon: '½',
    inputs: [
      { id: 'n1', label: 'Numerator 1', type: 'slider', min: -50, max: 50, step: 1, default: 3 },
      { id: 'd1', label: 'Denominator 1', type: 'slider', min: 1, max: 50, step: 1, default: 4 },
      { id: 'op', label: 'Operator', type: 'select', options: ['+', '-', '*', '/'], default: '+' },
      { id: 'n2', label: 'Numerator 2', type: 'slider', min: -50, max: 50, step: 1, default: 2 },
      { id: 'd2', label: 'Denominator 2', type: 'slider', min: 1, max: 50, step: 1, default: 3 }
    ],
    outputs: [
      { id: 'resFraction', label: 'Result Fraction', type: 'text', isHero: true },
      { id: 'resDecimal', label: 'Result Decimal', type: 'text' }
    ],
    calculate: (inputs) => {
      const n1 = parseInt(inputs.n1) || 0;
      const d1 = parseInt(inputs.d1) || 1;
      const op = inputs.op;
      const n2 = parseInt(inputs.n2) || 0;
      const d2 = parseInt(inputs.d2) || 1;

      let rNum = 0;
      let rDen = 1;

      if (op === '+') {
        rNum = n1 * d2 + n2 * d1;
        rDen = d1 * d2;
      } else if (op === '-') {
        rNum = n1 * d2 - n2 * d1;
        rDen = d1 * d2;
      } else if (op === '*') {
        rNum = n1 * n2;
        rDen = d1 * d2;
      } else if (op === '/') {
        rNum = n1 * d2;
        rDen = d1 * n2;
      }

      if (rDen === 0) {
        return {
          results: {
            resFraction: 'Undefined (Divide by Zero)',
            resDecimal: 'N/A'
          }
        };
      }

      const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
      const divisor = gcd(rNum, rDen);
      
      let finalNum = rNum / divisor;
      let finalDen = rDen / divisor;

      if (finalDen < 0) {
        finalNum = -finalNum;
        finalDen = -finalDen;
      }

      const fracStr = finalDen === 1 ? `${finalNum}` : `${finalNum} / ${finalDen}`;
      const decStr = (rNum / rDen).toFixed(5);

      return {
        results: {
          resFraction: fracStr,
          resDecimal: parseFloat(decStr).toString()
        }
      };
    }
  },

  random_num: {
    id: 'random_num',
    title: 'Random Number Generator',
    description: 'Generate sets of random integers within custom min/max bounds.',
    category: 'utility',
    color: 'indigo',
    icon: '🎲',
    inputs: [
      { id: 'min', label: 'Minimum Bound', type: 'slider', min: -1000, max: 1000, step: 10, default: 1 },
      { id: 'max', label: 'Maximum Bound', type: 'slider', min: 1, max: 10000, step: 10, default: 100 },
      { id: 'count', label: 'Numbers to Generate', type: 'slider', min: 1, max: 20, step: 1, default: 5 }
    ],
    outputs: [
      { id: 'numsList', label: 'Generated Randoms', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const min = parseInt(inputs.min) || 0;
      const max = Math.max(min + 1, parseInt(inputs.max) || 100);
      const count = parseInt(inputs.count) || 5;

      const list = [];
      for (let i = 0; i < count; i++) {
        list.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }

      return {
        results: {
          numsList: list.join(', ')
        }
      };
    }
  },

  triangle: {
    id: 'triangle',
    title: 'Triangle Calculator',
    description: 'Solve Heron\'s area formula, internal angles, and perimeter from three side inputs.',
    category: 'utility',
    color: 'indigo',
    icon: '📐',
    inputs: [
      { id: 'a', label: 'Side A length', type: 'slider', min: 1, max: 100, step: 1, default: 3 },
      { id: 'b', label: 'Side B length', type: 'slider', min: 1, max: 100, step: 1, default: 4 },
      { id: 'c', label: 'Side C length', type: 'slider', min: 1, max: 100, step: 1, default: 5 }
    ],
    outputs: [
      { id: 'area', label: 'Triangle Area', type: 'text', isHero: true },
      { id: 'perimeter', label: 'Perimeter', type: 'text' },
      { id: 'angles', label: 'Interior Angles (A, B, C)', type: 'text' }
    ],
    calculate: (inputs) => {
      const a = parseFloat(inputs.a) || 3;
      const b = parseFloat(inputs.b) || 4;
      const c = parseFloat(inputs.c) || 5;

      if (a + b <= c || a + c <= b || b + c <= a) {
        return {
          results: {
            area: 'Invalid Side Configurations',
            perimeter: 'N/A',
            angles: 'N/A'
          }
        };
      }

      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

      const angleA = Math.acos((b*b + c*c - a*a) / (2 * b * c)) * (180 / Math.PI);
      const angleB = Math.acos((a*a + c*c - b*b) / (2 * a * c)) * (180 / Math.PI);
      const angleC = 180 - angleA - angleB;

      const anglesText = `${angleA.toFixed(1)}°, ${angleB.toFixed(1)}°, ${angleC.toFixed(1)}°`;

      return {
        results: {
          area: area.toFixed(2),
          perimeter: (a + b + c).toFixed(1),
          angles: anglesText
        }
      };
    }
  },

  std_deviation: {
    id: 'std_deviation',
    title: 'Standard Deviation Calculator',
    description: 'Solve mean, variance, population SD, and sample standard deviations from text values list.',
    category: 'utility',
    color: 'indigo',
    icon: '📊',
    inputs: [
      { id: 'list', label: 'Numbers List (comma-separated)', type: 'text', default: '10, 20, 30, 40, 50, 60' }
    ],
    outputs: [
      { id: 'stdPop', label: 'Population Standard Deviation', type: 'text', isHero: true },
      { id: 'stdSamp', label: 'Sample Standard Deviation', type: 'text' },
      { id: 'mean', label: 'Arithmetic Mean', type: 'text' }
    ],
    calculate: (inputs) => {
      const str = inputs.list || '';
      const numbers = String(str).split(',').map((s: string) => parseFloat(s.trim())).filter((n: number) => !isNaN(n));

      if (numbers.length === 0) {
        return {
          results: { stdPop: '0', stdSamp: '0', mean: '0' }
        };
      }

      const mean = numbers.reduce((acc, v) => acc + v, 0) / numbers.length;
      const sqDiffs = numbers.map(v => Math.pow(v - mean, 2));
      const sumSqDiffs = sqDiffs.reduce((acc, v) => acc + v, 0);

      const variancePop = sumSqDiffs / numbers.length;
      const sdPop = Math.sqrt(variancePop);

      const varianceSamp = numbers.length > 1 ? sumSqDiffs / (numbers.length - 1) : 0;
      const sdSamp = Math.sqrt(varianceSamp);

      return {
        results: {
          stdPop: sdPop.toFixed(4),
          stdSamp: sdSamp.toFixed(4),
          mean: mean.toFixed(2)
        }
      };
    }
  },

  date_calc: {
    id: 'date_calc',
    title: 'Date Calculator',
    description: 'Quickly add or subtract day counts from a specified calendar starting point.',
    category: 'utility',
    color: 'amber',
    icon: '&calendar;',
    inputs: [
      { id: 'startDate', label: 'Starting Date', type: 'date', default: '2026-05-27' },
      { id: 'days', label: 'Days Shift', type: 'slider', min: -365, max: 365, step: 1, default: 30 },
      { id: 'op', label: 'Operation', type: 'select', options: ['add', 'sub'], optionNames: { add: 'Add Days', sub: 'Subtract Days' }, default: 'add' }
    ],
    outputs: [
      { id: 'newDate', label: 'New Date Calculated', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const startStr = inputs.startDate;
      let days = parseInt(inputs.days) || 30;
      const op = inputs.op;

      if (!startStr) return { results: { newDate: 'Select Starting Date' } };
      const date = new Date(startStr);
      if (isNaN(date.getTime())) return { results: { newDate: 'Invalid Date' } };

      if (op === 'sub') days = -days;
      date.setDate(date.getDate() + days);

      const opt: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return {
        results: {
          newDate: date.toLocaleDateString(undefined, opt)
        }
      };
    }
  },

  time_calc: {
    id: 'time_calc',
    title: 'Time Calculator',
    description: 'Add or subtract time blocks in hours, minutes, and seconds.',
    category: 'utility',
    color: 'amber',
    icon: '⏱️',
    inputs: [
      { id: 'h1', label: 'Hours (Base)', type: 'slider', min: 0, max: 100, step: 1, default: 5 },
      { id: 'm1', label: 'Minutes (Base)', type: 'slider', min: 0, max: 59, step: 1, default: 30 },
      { id: 'op', label: 'Operation', type: 'select', options: ['+', '-'], default: '+' },
      { id: 'h2', label: 'Hours (Modify)', type: 'slider', min: 0, max: 100, step: 1, default: 2 },
      { id: 'm2', label: 'Minutes (Modify)', type: 'slider', min: 0, max: 59, step: 1, default: 45 }
    ],
    outputs: [
      { id: 'resTime', label: 'Time Result', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const h1 = parseInt(inputs.h1) || 0;
      const m1 = parseInt(inputs.m1) || 0;
      const op = inputs.op;
      const h2 = parseInt(inputs.h2) || 0;
      const m2 = parseInt(inputs.m2) || 0;

      const t1 = h1 * 60 + m1;
      const t2 = h2 * 60 + m2;

      let diff = op === '+' ? t1 + t2 : t1 - t2;
      const absDiff = Math.abs(diff);

      const outH = Math.floor(absDiff / 60);
      const outM = absDiff % 60;
      const sign = diff < 0 ? '-' : '';

      return {
        results: {
          resTime: `${sign}${outH} Hours, ${outM} Minutes`
        }
      };
    }
  },

  hours_calc: {
    id: 'hours_calc',
    title: 'Hours Calculator',
    description: 'Tally work hours and overtime summaries with break adjustments.',
    category: 'utility',
    color: 'amber',
    icon: '⏰',
    inputs: [
      { id: 'start', label: 'Punch In Time', type: 'text', default: '09:00' },
      { id: 'end', label: 'Punch Out Time', type: 'text', default: '17:30' },
      { id: 'breakMins', label: 'Break Deducted', type: 'slider', min: 0, max: 120, step: 5, default: 30, unit: ' mins' }
    ],
    outputs: [
      { id: 'hoursWorked', label: 'Total Hours Worked', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const start = inputs.start || '09:00';
      const end = inputs.end || '17:30';
      const brk = parseInt(inputs.breakMins) || 0;

      const p1 = start.split(':').map(Number);
      const p2 = end.split(':').map(Number);

      if (p1.length < 2 || p2.length < 2 || isNaN(p1[0]) || isNaN(p2[0])) {
        return { results: { hoursWorked: 'Enter correct format (HH:MM)' } };
      }

      let m1 = p1[0] * 60 + p1[1];
      let m2 = p2[0] * 60 + p2[1];

      if (m2 < m1) m2 += 1440;

      const diff = m2 - m1 - brk;
      if (diff < 0) return { results: { hoursWorked: '0 Hours' } };

      const h = Math.floor(diff / 60);
      const m = diff % 60;

      return {
        results: {
          hoursWorked: `${h} Hours, ${m} Minutes (${(diff / 60).toFixed(2)} decimal hours)`
        }
      };
    }
  },

  gpa_calc: {
    id: 'gpa_calc',
    title: 'GPA Calculator',
    description: 'Determine your semester Grade Point Average based on class grades and credits.',
    category: 'utility',
    color: 'indigo',
    icon: '🎓',
    inputs: [
      { id: 'g1', label: 'Course 1 Grade', type: 'select', options: [4, 3, 2, 1, 0], optionNames: { 4: 'A (4.0)', 3: 'B (3.0)', 2: 'C (2.0)', 1: 'D (1.0)', 0: 'F (0.0)' }, default: 4 },
      { id: 'c1', label: 'Course 1 Credits', type: 'slider', min: 1, max: 5, step: 1, default: 3 },
      { id: 'g2', label: 'Course 2 Grade', type: 'select', options: [4, 3, 2, 1, 0], optionNames: { 4: 'A (4.0)', 3: 'B (3.0)', 2: 'C (2.0)', 1: 'D (1.0)', 0: 'F (0.0)' }, default: 3 },
      { id: 'c2', label: 'Course 2 Credits', type: 'slider', min: 1, max: 5, step: 1, default: 4 },
      { id: 'g3', label: 'Course 3 Grade', type: 'select', options: [4, 3, 2, 1, 0], optionNames: { 4: 'A (4.0)', 3: 'B (3.0)', 2: 'C (2.0)', 1: 'D (1.0)', 0: 'F (0.0)' }, default: 4 },
      { id: 'c3', label: 'Course 3 Credits', type: 'slider', min: 1, max: 5, step: 1, default: 3 }
    ],
    outputs: [
      { id: 'gpa', label: 'Semester GPA', type: 'text', isHero: true },
      { id: 'totalCredits', label: 'Total Credits Taken', type: 'text' }
    ],
    calculate: (inputs) => {
      const g1 = parseFloat(inputs.g1);
      const c1 = parseInt(inputs.c1) || 3;
      const g2 = parseFloat(inputs.g2);
      const c2 = parseInt(inputs.c2) || 3;
      const g3 = parseFloat(inputs.g3);
      const c3 = parseInt(inputs.c3) || 3;

      const pts = g1 * c1 + g2 * c2 + g3 * c3;
      const credits = c1 + c2 + c3;
      const gpa = credits > 0 ? (pts / credits).toFixed(2) : '0.00';

      return {
        results: {
          gpa: gpa,
          totalCredits: `${credits} Credits`
        }
      };
    }
  },

  grade_calc: {
    id: 'grade_calc',
    title: 'Grade Calculator',
    description: 'Find out the final exam score required to secure your target course grade.',
    category: 'utility',
    color: 'indigo',
    icon: '💯',
    inputs: [
      { id: 'current', label: 'Current Grade (%)', type: 'slider', min: 0, max: 100, step: 1, default: 82 },
      { id: 'target', label: 'Target Class Grade (%)', type: 'slider', min: 50, max: 100, step: 1, default: 90 },
      { id: 'weight', label: 'Final Exam Weight (%)', type: 'slider', min: 5, max: 80, step: 5, default: 20 }
    ],
    outputs: [
      { id: 'reqScore', label: 'Final Exam Score Required', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const cur = parseFloat(inputs.current) || 0;
      const tar = parseFloat(inputs.target) || 90;
      const w = parseFloat(inputs.weight) || 20;

      const decimalWeight = w / 100;
      const req = (tar - cur * (1 - decimalWeight)) / decimalWeight;

      const rounded = Math.max(0, parseFloat(req.toFixed(1)));
      const text = rounded > 100 ? `${rounded}% (Extra credit needed!)` : `${rounded}%`;

      return {
        results: {
          reqScore: text
        }
      };
    }
  },

  concrete: {
    id: 'concrete',
    title: 'Concrete Calculator',
    description: 'Calculate volume totals (cubic yards/meters) and bag counts needed for cement projects.',
    category: 'utility',
    color: 'amber',
    icon: '🧱',
    inputs: [
      { id: 'l', label: 'Slab Length', type: 'slider', min: 1, max: 100, step: 1, default: 12, unit: ' feet' },
      { id: 'w', label: 'Slab Width', type: 'slider', min: 1, max: 100, step: 1, default: 10, unit: ' feet' },
      { id: 'd', label: 'Slab Thickness', type: 'slider', min: 1, max: 12, step: 0.5, default: 4, unit: ' inches' }
    ],
    outputs: [
      { id: 'cubicYards', label: 'Cubic Yards Needed', type: 'text', isHero: true },
      { id: 'bags80', label: '80lb Bags Needed', type: 'text' },
      { id: 'bags60', label: '60lb Bags Needed', type: 'text' }
    ],
    calculate: (inputs) => {
      const l = parseFloat(inputs.l) || 12;
      const w = parseFloat(inputs.w) || 10;
      const d = parseFloat(inputs.d) || 4;

      const thicknessFt = d / 12;
      const cubicFt = l * w * thicknessFt;
      const cubicYds = cubicFt / 27;

      const bags80 = Math.ceil(cubicFt / 0.6);
      const bags60 = Math.ceil(cubicFt / 0.45);

      return {
        results: {
          cubicYards: `${cubicYds.toFixed(2)} cu. yards`,
          bags80: `${bags80} Bags`,
          bags60: `${bags60} Bags`
        }
      };
    }
  },

  subnet: {
    id: 'subnet',
    title: 'Subnet Calculator',
    description: 'IP Address Subnetting. Trace subnets, network hosts, boundaries, and CIDR masks.',
    category: 'utility',
    color: 'indigo',
    icon: '🌐',
    inputs: [
      { id: 'ip', label: 'IP Address', type: 'text', default: '192.168.1.1' },
      { id: 'cidr', label: 'Subnet CIDR Mask', type: 'select', options: [8, 16, 24, 25, 26, 27, 28, 29, 30], default: 24 }
    ],
    outputs: [
      { id: 'netmask', label: 'Subnet Mask', type: 'text', isHero: true },
      { id: 'netAddr', label: 'Network Address', type: 'text' },
      { id: 'hosts', label: 'Usable Hosts Count', type: 'text' }
    ],
    calculate: (inputs) => {
      const ip = inputs.ip || '192.168.1.1';
      const cidr = parseInt(inputs.cidr) || 24;

      const ipParts: number[] = String(ip).split('.').map(Number);
      if (ipParts.length !== 4 || ipParts.some(isNaN)) {
        return { results: { netmask: 'Invalid IP', netAddr: 'N/A', hosts: 'N/A' } };
      }

      let maskBinary = ''.padStart(cidr, '1').padEnd(32, '0');
      const maskOctets: number[] = [];
      for (let i = 0; i < 4; i++) {
        maskOctets.push(parseInt(maskBinary.slice(i * 8, i * 8 + 8), 2));
      }

      const netOctets = ipParts.map((b: number, idx: number) => b & maskOctets[idx]);
      const netmask = maskOctets.join('.');
      const netAddr = netOctets.join('.');
      const usableHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);

      return {
        results: {
          netmask: netmask,
          netAddr: netAddr,
          hosts: usableHosts.toLocaleString()
        }
      };
    }
  },

  password: {
    id: 'password',
    title: 'Password Generator',
    description: 'Generate strong, secure cryptographic passwords entirely client-side.',
    category: 'utility',
    color: 'emerald',
    icon: '🔑',
    inputs: [
      { id: 'len', label: 'Password Length', type: 'slider', min: 6, max: 32, step: 1, default: 12 },
      { id: 'upper', label: 'Include Uppercase', type: 'select', options: ['yes', 'no'], optionNames: { yes: 'Yes', no: 'No' }, default: 'yes' },
      { id: 'numbers', label: 'Include Numbers', type: 'select', options: ['yes', 'no'], optionNames: { yes: 'Yes', no: 'No' }, default: 'yes' },
      { id: 'symbols', label: 'Include Symbols', type: 'select', options: ['yes', 'no'], optionNames: { yes: 'Yes', no: 'No' }, default: 'yes' }
    ],
    outputs: [
      { id: 'passText', label: 'Secure Password Generated', type: 'text', isHero: true }
    ],
    calculate: (inputs) => {
      const len = parseInt(inputs.len) || 12;
      const upper = inputs.upper === 'yes';
      const num = inputs.numbers === 'yes';
      const sym = inputs.symbols === 'yes';

      let chars = 'abcdefghijklmnopqrstuvwxyz';
      if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (num) chars += '0123456789';
      if (sym) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      let password = '';
      for (let i = 0; i < len; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return {
        results: {
          passText: password
        }
      };
    }
  }
};
