import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, Share2 } from 'lucide-react';
import './styles.css';

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 2 });
const money = (v) => Number.isFinite(v) ? currency.format(v) : '$0.00';
const num = (v) => {
  const parsed = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

function repayment({ amount, annualRate, months, balloon }) {
  const monthlyRate = annualRate / 100 / 12;
  if (months <= 0) return 0;
  if (monthlyRate === 0) return (amount - balloon) / months;
  const balloonPV = balloon / Math.pow(1 + monthlyRate, months);
  const financed = amount - balloonPV;
  return (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function App() {
  const [price, setPrice] = useState('132940');
  const [deposit, setDeposit] = useState('0');
  const [trade, setTrade] = useState('15000');
  const [payout, setPayout] = useState('0');
  const [fees, setFees] = useState('2190');
  const [rate, setRate] = useState('9.25');
  const [term, setTerm] = useState('60');
  const [balloon, setBalloon] = useState('65000');

  const r = useMemo(() => {
    const p = num(price), d = num(deposit), t = num(trade), po = num(payout), f = num(fees), rt = num(rate), m = num(term), b = num(balloon);
    const equity = d + t - po;
    const amountFinanced = Math.max(p - equity, 0) + f;
    const monthly = repayment({ amount: amountFinanced, annualRate: rt, months: m, balloon: b });
    return {
      amountFinanced,
      monthly,
      weekly: monthly * 12 / 52,
      fortnightly: monthly * 12 / 26,
      total: monthly * m + b,
      interest: monthly * m + b - amountFinanced,
      balloonPct: p ? b / p * 100 : 0
    };
  }, [price, deposit, trade, payout, fees, rate, term, balloon]);

  const shareQuote = async () => {
    const text = `CAVALO PRESTIGE finance estimate\nMonthly: ${money(r.monthly)}\nWeekly: ${money(r.weekly)}\nAmount financed: ${money(r.amountFinanced)}\nBalloon: ${money(num(balloon))}`;
    if (navigator.share) await navigator.share({ title: 'Cavalo Finance Estimate', text });
    else await navigator.clipboard.writeText(text);
  };

  return <main className="app">
    <section className="topbar">
      <div className="brand">
        <div className="logo">CAVALO</div>
        <div className="prestige"><span></span>PRESTIGE<span></span></div>
      </div>
    </section>

    <section className="hero">
      <Car size={22} />
      <p>Finance Calculator</p>
      <h1>{money(r.monthly)}</h1>
      <small>estimated monthly repayment</small>
      <button className="share" onClick={shareQuote}><Share2 size={16}/> Share quote</button>
    </section>

    <section className="panel">
      <Input label="Purchase price" value={price} setValue={setPrice} prefix="$" />
      <Input label="Cash deposit" value={deposit} setValue={setDeposit} prefix="$" />
      <Input label="Trade allowance" value={trade} setValue={setTrade} prefix="$" />
      <Input label="Existing payout" value={payout} setValue={setPayout} prefix="$" />
      <Input label="Fees financed" value={fees} setValue={setFees} prefix="$" />
      <Input label="Interest rate" value={rate} setValue={setRate} suffix="%" />
      <Input label="Loan term" value={term} setValue={setTerm} suffix="months" />
      <Input label="Balloon" value={balloon} setValue={setBalloon} prefix="$" />
    </section>

    <section className="panel summary">
      <Row label="Amount financed" value={money(r.amountFinanced)} />
      <Row label="Weekly" value={money(r.weekly)} />
      <Row label="Fortnightly" value={money(r.fortnightly)} />
      <Row label="Balloon %" value={`${r.balloonPct.toFixed(2)}%`} />
      <Row label="Total repaid" value={money(r.total)} />
      <Row label="Interest component" value={money(r.interest)} />
    </section>

    <footer>Estimate only. Subject to lender approval and final conditions.</footer>
  </main>;
}

function Input({ label, value, setValue, prefix, suffix }) {
  return <label className="field">
    <span>{label}</span>
    <div><b>{prefix}</b><input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /><b>{suffix}</b></div>
  </label>;
}

function Row({ label, value }) {
  return <div className="row"><span>{label}</span><strong>{value}</strong></div>;
}

createRoot(document.getElementById('root')).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
