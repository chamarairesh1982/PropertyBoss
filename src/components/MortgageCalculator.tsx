import { useState } from 'react';

interface MortgageCalculatorProps {
  price: number;
  initialDeposit?: number;
  initialTerm?: number; // years
}

/**
 * Simple mortgage calculator using a fixed 5% interest rate.  Users can adjust
 * the deposit and term to estimate monthly repayments.
 */
export default function MortgageCalculator({
  price,
  initialDeposit,
  initialTerm = 25,
}: MortgageCalculatorProps) {
  const [deposit, setDeposit] = useState(initialDeposit ?? Math.round(price * 0.1));
  const [term, setTerm] = useState(initialTerm);

  const principal = Math.max(price - deposit, 0);
  const rate = 0.05 / 12; // fixed 5% APR
  const payments = term * 12;
  const monthly =
    rate === 0
      ? principal / payments
      : (principal * rate * Math.pow(1 + rate, payments)) /
        (Math.pow(1 + rate, payments) - 1);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-sm" htmlFor="deposit">
          Deposit (£)
        </label>
        <input
          id="deposit"
          type="number"
          className="border rounded p-1 w-full sm:w-32"
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />
        <label className="text-sm" htmlFor="term">
          Term (years)
        </label>
        <input
          id="term"
          type="number"
          className="border rounded p-1 w-full sm:w-20"
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
        />
      </div>
      <p className="font-medium">
        Monthly payment: £{Number.isFinite(monthly) ? monthly.toFixed(2) : '0.00'}
      </p>
    </div>
  );
}
