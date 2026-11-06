import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import './mediator-board.css';
import './mediator-page.css';
import './mediator-dashboard.css';

const storageKey = 'raithamitra-mediator-prices-v1';
const examples = [
  { id:'demo-tomato-1', cropCode:'TOMATO', name:'Suma Fresh Produce', price:2150, phone:'+91 90000 10001', email:'suma@example.com' },
  { id:'demo-tomato-2', cropCode:'TOMATO', name:'Kiran Farm Connect', price:2050, phone:'+91 90000 10002', email:'kiran@example.com' },
  { id:'demo-onion-1', cropCode:'ONION', name:'Lakshmi Crop Traders', price:1950, phone:'+91 90000 10003', email:'lakshmi@example.com' },
  { id:'demo-potato-1', cropCode:'POTATO', name:'Mohan Agri Link', price:1600, phone:'+91 90000 10004', email:'mohan@example.com' },
  { id:'demo-maize-1', cropCode:'MAIZE', name:'Ravi Grain Partners', price:2200, phone:'+91 90000 10005', email:'ravi@example.com' },
  { id:'demo-paddy-1', cropCode:'PADDY', name:'Anita Harvest Network', price:2380, phone:'+91 90000 10006', email:'anita@example.com' },
  { id:'demo-ragi-1', cropCode:'RAGI', name:'Naveen Millet Traders', price:3300, phone:'+91 90000 10007', email:'naveen@example.com' },
  { id:'demo-cotton-1', cropCode:'COTTON', name:'Patil Cotton Link', price:6900, phone:'+91 90000 10008', email:'patil@example.com' },
  { id:'demo-chilli-1', cropCode:'CHILLI', name:'Meena Spice Buyers', price:4400, phone:'+91 90000 10009', email:'meena@example.com' },
  { id:'demo-brinjal-1', cropCode:'BRINJAL', name:'Gowda Vegetable Link', price:2000, phone:'+91 90000 10010', email:'gowda@example.com' },
  { id:'demo-tur-1', cropCode:'TUR', name:'Shetty Pulse Traders', price:7350, phone:'+91 90000 10011', email:'shetty@example.com' }
];

function readListings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey));
    return Array.isArray(saved) ? [...examples, ...saved] : examples;
  } catch {
    return examples;
  }
}

export default function MediatorBoard({ cropCode, cropName }) {
  const [listings, setListings] = useState(readListings);
  const [formOpen, setFormOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [form, setForm] = useState({ name:'', price:'', phone:'', email:'' });
  const [message, setMessage] = useState('');
  const cropListings = useMemo(() => listings.filter(item => item.cropCode === cropCode).sort((a,b) => Number(b.price)-Number(a.price)), [listings,cropCode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(listings.filter(item => !String(item.id).startsWith('demo-'))));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [listings]);

  function submit(event) {
    event.preventDefault();
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setMessage('Enter a price greater than zero.');
      return;
    }
    const id = window.crypto?.randomUUID?.() || `mediator-${Date.now()}`;
    setListings(current => [...current, { id, cropCode, name:form.name.trim(), price, phone:form.phone.trim(), email:form.email.trim() }]);
    setForm({ name:'', price:'', phone:'', email:'' });
    setMessage('Mediator price added for this crop.');
    setFormOpen(false);
  }

  const listingForm = formOpen && <form className="mediator-form" onSubmit={submit}>
      <label>Mediator name<input required maxLength="100" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Name or business"/></label>
      <label>Price per quintal (₹)<input required type="number" min="1" step="1" value={form.price} onChange={event=>setForm({...form,price:event.target.value})} placeholder="e.g. 2200"/></label>
      <label>Phone number<input required type="tel" maxLength="24" value={form.phone} onChange={event=>setForm({...form,phone:event.target.value})} placeholder="Contact number"/></label>
      <label>Email address<input required type="email" maxLength="120" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="name@example.com"/></label>
      <div className="mediator-form-actions"><small>Saved in this browser. Example listings are marked as sample data.</small><button type="submit">Save price</button></div>
    </form>;
  const content = <>
    {message && <div className="mediator-message" role="status">{message}</div>}
    {listingForm}
    <div className="mediator-list">
      {cropListings.length ? cropListings.map(item => <article className="mediator-card" key={item.id}>
        <div className="mediator-card-main"><div><h3>{item.name}</h3><span className="mediator-crop">{cropName}</span></div><div className="mediator-price"><b>₹{new Intl.NumberFormat('en-IN').format(item.price)}</b><small>per quintal</small></div></div>
        <div className="mediator-contact"><a href={`tel:${item.phone}`}><Phone size={13}/>{item.phone}</a><a href={`mailto:${item.email}`}><Mail size={13}/>{item.email}</a></div>
        {String(item.id).startsWith('demo-') && <span className="mediator-sample">SAMPLE LISTING</span>}
      </article>) : <div className="api-loading">No mediator prices yet for {cropName}. Add the first listing.</div>}
    </div>
    <p className="mediator-footnote">Prices and contact details are sample or user-entered information. Confirm the offer and terms directly.</p>
  </>;

  if (pageOpen) return <main className="mediator-page">
    <header className="mediator-page-header"><button type="button" className="mediator-back-button" onClick={() => setPageOpen(false)}>← Back to dashboard</button><span>RAITHAMITRA · BUYER CONNECTIONS</span></header>
    <section className="mediator-page-content">
      <div className="mediator-heading"><div><div className="eyebrow">CROP BUYER CONNECTIONS</div><h1>Mediator prices</h1><p>Compare buyer offers and contact mediators for {cropName}.</p></div><button className="mediator-add-button" type="button" onClick={() => { setFormOpen(value => !value); setMessage(''); }}><Plus size={15}/>{formOpen ? 'Close form' : 'Add mediator price'}</button></div>
      {content}
    </section>
  </main>;

  return <button className="mediator-dashboard-link" type="button" onClick={() => setPageOpen(true)}>
    <span><b>Mediator prices</b><small>View crop offers and contact mediators</small></span><span className="mediator-dashboard-arrow" aria-hidden="true">→</span>
  </button>;
}
