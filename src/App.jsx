import React, { useMemo, useState } from "react";
import { Calculator, Car, ClipboardList, FileText, Menu, MoreHorizontal, Percent } from "lucide-react";

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

function money(value) {
  return Number.isFinite(value) ? aud.format(value) : "$0.00";
}

function cleanNumber(value) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function repayment({ amountFinanced, annualRate, months, balloon }) {
  const rate = annualRate / 100 / 12;
  if (!months) return 0;
  if (!rate) return (amountFinanced - balloon) / months;

  const balloonPv = balloon / Math.pow(1 + rate, months);
  const adjustedPrincipal = amountFinanced - balloonPv;

  return (adjustedPrincipal * rate) / (1 - Math.pow(1 + rate, -months));
}

export default function CavaloPrestigeFinanceApp() {
  const [purchasePrice, setPurchasePrice] = useState("132940");
  const [cashDeposit, setCashDeposit] = useState("0");
  const [tradeAllowance, setTradeAllowance] = useState("15000");
  const [existingPayout, setExistingPayout] = useState("0");
  const [interestRate, setInterestRate] = useState("7.49");
  const [loanTerm, setLoanTerm] = useState("60");
  const [balloonAmount, setBalloonAmount] = useState("65000");
  const [fees, setFees] = useState("2190");
  const [editMode, setEditMode] = useState(false);

  const calc = useMemo(() => {
    const price = cleanNumber(purchasePrice);
    const deposit = cleanNumber(cashDeposit);
    const trade = cleanNumber(tradeAllowance);
    const payout = cleanNumber(existingPayout);
    const rate = cleanNumber(interestRate);
    const months = cleanNumber(loanTerm);
    const balloon = cleanNumber(balloonAmount);
    const feeTotal = cleanNumber(fees);

    const totalEquity = deposit + trade - payout;
    const subtotal = Math.max(price - totalEquity, 0);
    const amountFinanced = subtotal + feeTotal;
    const monthly = repayment({ amountFinanced, annualRate: rate, months, balloon });
    const totalPayable = monthly * months + balloon;

    return {
      price,
      deposit,
      trade,
      payout,
      totalEquity,
      subtotal,
      amountFinanced,
      rate,
      months,
      balloon,
      balloonPercent: price ? (balloon / price) * 100 : 0,
      monthly,
      weekly: (monthly * 12) / 52,
      fortnightly: (monthly * 12) / 26,
      totalPayable,
      interest: totalPayable - amountFinanced,
    };
  }, [purchasePrice, cashDeposit, tradeAllowance, existingPayout, interestRate, loanTerm, balloonAmount, fees]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-md overflow-hidden border-x border-neutral-900 bg-black pb-28">
        <TopBar />

        <main className="space-y-5 px-4 pt-6">
          <Hero monthly={calc.monthly} />

          <InfoCard
            icon={<FileText className="h-5 w-5 text-[#41bf28]" />}
            title="Purchase Details"
            action={
              <button onClick={() => setEditMode(!editMode)} className="text-sm font-medium text-[#41bf28]">
                {editMode ? "Done" : "Edit"}
              </button>
            }
          >
            {editMode ? (
              <div className="space-y-4 pt-2">
                <EditField label="Purchase Price" value={purchasePrice} setValue={setPurchasePrice} prefix="$" />
                <EditField label="Less Cash Deposit" value={cashDeposit} setValue={setCashDeposit} prefix="$" />
                <EditField label="Less Trade Allowance" value={tradeAllowance} setValue={setTradeAllowance} prefix="$" />
                <EditField label="Add Payout of Existing Finance" value={existingPayout} setValue={setExistingPayout} prefix="$" />
                <EditField label="Fees / Costs Financed" value={fees} setValue={setFees} prefix="$" />
              </div>
            ) : (
              <>
                <Row label="Purchase Price" value={money(calc.price)} />
                <Row label="Less Cash Deposit" value={money(calc.deposit)} />
                <Row label="Less Trade Allowance" value={money(calc.trade)} />
                <Row label="Add Payout of Existing Finance" value={money(calc.payout)} />
                <Row label="Total Equity" value={money(calc.totalEquity)} />
                <Row label="Sub Total" value={money(calc.subtotal)} />
              </>
            )}
          </InfoCard>

          <InfoCard icon={<Percent className="h-5 w-5 text-[#41bf28]" />} title="Repayment Summary">
            {editMode ? (
              <div className="space-y-4 pt-2">
                <EditField label="Interest Rate" value={interestRate} setValue={setInterestRate} suffix="%" />
                <EditField label="Loan Term" value={loanTerm} setValue={setLoanTerm} suffix="months" />
                <EditField label="Balloon Amount" value={balloonAmount} setValue={setBalloonAmount} prefix="$" />
              </div>
            ) : (
              <>
                <Row label="Interest Rate (p.a.)" value={`${calc.rate.toFixed(2)}%`} />
                <Row label="Loan Term" value={`${calc.months} months`} />
                <Row label="Balloon (% of Purchase Price)" value={`${calc.balloonPercent.toFixed(2)}%`} />
                <Row label="Balloon Amount" value={money(calc.balloon)} />
                <Row label="Repayment Frequency" value="Monthly (Arrears)" />
              </>
            )}

            <div className="mt-5 rounded-xl bg-white/[0.07] px-4 py-3 shadow-inner">
              <Row label="Monthly Repayment" value={money(calc.monthly)} strong />
              <Row label="Total Repayable" value={money(calc.totalPayable)} />
              <Row label="Interest Component" value={money(calc.interest)} />
              <Row label="Weekly Equivalent" value={money(calc.weekly)} />
              <Row label="Fortnightly Equivalent" value={money(calc.fortnightly)} />
            </div>
          </InfoCard>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="border-b border-[#41bf28] px-7 pb-5 pt-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-black leading-none tracking-[0.18em]">CAVALO</div>
          <div className="mt-1 flex items-center gap-2 text-xs tracking-[0.45em] text-white/80">
            <span className="h-px w-9 bg-white/70" />
            PRESTIGE
            <span className="h-px w-9 bg-white/70" />
          </div>
        </div>
        <Menu className="h-8 w-8 text-white/90" />
      </div>
    </header>
  );
}

function Hero({ monthly }) {
  return (
    <section className="rounded-md border border-white/15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_55%,transparent)] px-5 py-8 text-center shadow-[0_0_50px_rgba(255,255,255,0.04)]">
      <Car className="mx-auto h-7 w-7 text-white" />
      <p className="mt-6 text-lg font-medium tracking-[0.38em] text-white/70">FINANCE CALCULATOR</p>
      <p className="mt-5 text-6xl font-light tracking-tight text-white">{money(monthly)}</p>
      <p className="mt-4 text-lg text-white/75">estimated monthly repayment</p>
    </section>
  );
}

function InfoCard({ icon, title, action, children }) {
  return (
    <section className="rounded-md border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-semibold uppercase tracking-[0.28em] text-white/90">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-[15px] leading-snug text-white/70">{label}</span>
      <span className={`text-right text-[15px] ${strong ? "font-black text-white" : "font-medium text-white/90"}`}>{value}</span>
    </div>
  );
}

function EditField({ label, value, setValue, prefix, suffix }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/45">{label}</span>
      <div className="flex items-center rounded-md border border-white/15 bg-black/40 px-3 py-2">
        {prefix && <span className="text-white/45">{prefix}</span>}
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent px-2 text-base font-semibold text-white outline-none"
        />
        {suffix && <span className="text-sm text-white/45">{suffix}</span>}
      </div>
    </label>
  );
}

function BottomNav() {
  const items = [
    [Calculator, "Calculator", true],
    [Car, "Vehicles", false],
    [ClipboardList, "My Quotes", false],
    [MoreHorizontal, "More", false],
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-white/15 bg-black/95 px-5 pb-6 pt-3 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map(([Icon, label, active]) => (
          <button key={label} className="flex flex-col items-center gap-1 text-xs">
            <Icon className={`h-6 w-6 ${active ? "text-[#41bf28]" : "text-white/75"}`} />
            <span className={active ? "text-[#41bf28]" : "text-white/75"}>{label}</span>
          </button>
        ))}
      </div>
      <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-white" />
    </nav>
  );
}
