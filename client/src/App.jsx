import { useEffect, useMemo, useRef, useState } from 'react';
import { Sprout, Mic, Search, MapPin, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus, Truck, Warehouse, ArrowUpRight, CircleHelp, Volume2, Check, Leaf, CalendarDays, BadgeCheck, Menu, X, Wheat, Clock3 } from 'lucide-react';
import en from './locales/en.json';
import kn from './locales/kn.json';
import { listen, speak } from './services/speechRecognition';
import { parseIntent } from './services/intentParser';
import { api } from './services/api';
import MediatorBoard from './MediatorBoard';

const crops = [
  { code:'TOMATO', en:'Tomato', kn:'ಟೊಮೇಟೊ', emoji:'🍅', color:'coral', trend:'+4.2%', price:2000, perish:'HIGH' },
  { code:'ONION', en:'Onion', kn:'ಈರುಳ್ಳಿ', emoji:'🧅', color:'violet', trend:'−1.8%', price:1800, perish:'MEDIUM' },
  { code:'POTATO', en:'Potato', kn:'ಆಲೂಗಡ್ಡೆ', emoji:'🥔', color:'gold', trend:'+2.1%', price:1500, perish:'MEDIUM' },
  { code:'MAIZE', en:'Maize', kn:'ಮೆಕ್ಕೆಜೋಳ', emoji:'🌽', color:'yellow', trend:'+1.2%', price:2100, perish:'LOW' },
  { code:'PADDY', en:'Paddy', kn:'ಭತ್ತ', emoji:'🌾', color:'green', trend:'+0.8%', price:2300, perish:'LOW' },
  { code:'RAGI', en:'Ragi', kn:'ರಾಗಿ', emoji:'🌾', color:'plum', trend:'−0.5%', price:3200, perish:'LOW' },
  { code:'COTTON', en:'Cotton', kn:'ಹತ್ತಿ', emoji:'☁️', color:'blue', trend:'+3.1%', price:6800, perish:'LOW' },
  { code:'CHILLI', en:'Green chilli', kn:'ಹಸಿಮೆಣಸಿನಕಾಯಿ', emoji:'🌶️', color:'green', trend:'+5.4%', price:4200, perish:'HIGH' },
  { code:'BRINJAL', en:'Brinjal', kn:'ಬದನೆಕಾಯಿ', emoji:'🍆', color:'plum', trend:'−2.1%', price:1900, perish:'HIGH' },
  { code:'TUR', en:'Tur / Pigeon pea', kn:'ತೊಗರಿ', emoji:'🫘', color:'gold', trend:'+2.6%', price:7200, perish:'LOW' }
];
const markets = [
  { id:'market-a', name:'Yeshwanthpur APMC', district:'Bengaluru Urban', distance:42, min:1500, max:2400, modal:2000, transport:1500, source:'Demo price fixture', date:'05 Nov 2026', freshness:'Reported today' },
  { id:'market-b', name:'Ramanagara Market', district:'Ramanagara', distance:58, min:1700, max:2600, modal:2200, transport:1950, source:'Demo price fixture', date:'05 Nov 2026', freshness:'Reported today' },
  { id:'market-c', name:'Kolar APMC', district:'Kolar', distance:76, min:1800, max:2500, modal:2100, transport:2400, source:'Demo price fixture', date:'04 Nov 2026', freshness:'Reported yesterday' }
];
const money = value => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(value);
const num = value => new Intl.NumberFormat('en-IN').format(value);

export default function App() {
  const [language, setLanguage] = useState('en');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [cropCode, setCropCode] = useState('TOMATO');
  const [quantity, setQuantity] = useState(20);
  const [district, setDistrict] = useState('Ramanagara');
  const [village, setVillage] = useState('');
  const [activeNav, setActiveNav] = useState('Overview');
  const [voiceText, setVoiceText] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const [comparisonComplete, setComparisonComplete] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState('');
  const [transportMatch, setTransportMatch] = useState(null);
  const [selectedTransportMarket, setSelectedTransportMarket] = useState(null);
  const [outlookData, setOutlookData] = useState(null);
  const [outlookLoading, setOutlookLoading] = useState(false);
  const [outlookError, setOutlookError] = useState('');
  const [transportError, setTransportError] = useState('');
  const [storageListings, setStorageListings] = useState([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [selectedStorageId, setSelectedStorageId] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [joinFormOpen, setJoinFormOpen] = useState(false);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [farmerForm, setFarmerForm] = useState({farmerName:'',phoneNumber:'',quantityQuintals:'',pickupPlace:'',destinationMarket:''});
  const [costs, setCosts] = useState({ transport:1500, loading:200, unloading:200, commission:1, other:100, spoilage:2 });
  useEffect(() => { const timer = window.setInterval(() => setCurrentTime(new Date()), 60000); return () => window.clearInterval(timer); }, []);
  const [apiPrices, setApiPrices] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const crop = crops.find(item => item.code === cropCode) || crops[0];
  const t = language === 'kn' ? kn : en;
  const hour = currentTime.getHours();
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 17 ? 'greetingAfternoon' : 'greetingEvening';
  const dateLocale = language === 'kn' ? 'kn-IN' : 'en-IN';
  const localDateLabel = new Intl.DateTimeFormat(dateLocale,{day:'numeric',month:'short',year:'numeric'}).format(currentTime);
  const formatForecastDate = value => { if(!value)return 'Unavailable'; const [year,month,day]=value.slice(0,10).split('-').map(Number); return new Intl.DateTimeFormat(dateLocale,{day:'numeric',month:'short',year:'numeric'}).format(new Date(year,month-1,day)); };
  useEffect(() => { let active=true; setApiPrices(null); setAvailableDistricts([]); setPriceLoading(true); setPriceError(''); setComparisonComplete(false); setShowAll(false); api.prices(cropCode).then(result=>{ if(!active)return; if(result?.prices) { setApiPrices(result); const places=[...new Set(result.prices.map(price=>price.district).filter(Boolean))].sort(); setAvailableDistricts(places); setDistrict(current=>places.includes(current)?current:(places[0]||'')); } else setPriceError(result?.error || 'Could not load market prices from the API.'); setPriceLoading(false); }); return ()=>{ active=false; }; }, [cropCode]);
  useEffect(() => { let active=true; setTransportMatch(null); setTransportError(''); setJoinStatus(''); setJoinFormOpen(false); if(!selectedTransportMarket){return ()=>{active=false;};} api.matches(cropCode,selectedTransportMarket.id).then(result=>{ if(!active)return; if(result?.requests) setTransportMatch(result); else setTransportError(result?.error || 'Could not load transport matches.'); }); return ()=>{ active=false; }; }, [cropCode, selectedTransportMarket?.id]);
    useEffect(() => { let active=true; setStorageListings([]); setStorageError(''); setSelectedStorageId('');  setStorageLoading(true); api.storage(cropCode,district).then(result=>{if(!active)return;if(result?.error)setStorageError(result.error);else setStorageListings(result.data||[]);setStorageLoading(false);}).catch(error=>{if(!active)return;setStorageError(error.message||'Could not load nearby storage.');setStorageLoading(false);}); return ()=>{active=false;}; }, [cropCode,district]);
  const options = useMemo(() => {
    const fromApi = [...new Map((apiPrices?.prices || []).filter(p => p.market && String(p.district || '').toLowerCase() === district.toLowerCase()).map(p => [`${p.district}|${p.market}`, p])).values()].map((p, i) => ({ ...p, id:p.marketId || `${p.district}-${p.market}-${i}`, name:p.market, district:p.district, min:p.minPrice, max:p.maxPrice, modal:p.modalPrice, date:p.arrivalDate || apiPrices?.reportDate, freshness:p.dataMode === 'DEMO' ? 'Sample fixture' : 'Latest reported', source:p.source || apiPrices?.source, distance:p.distanceKm ?? 'N/A', transport:p.transportCost ?? costs.transport, live:p.dataMode === 'LIVE' }));
    return fromApi.map(market => {
      const spoilageQty = quantity * costs.spoilage / 100;
      const afterSpoilage = (quantity - spoilageQty) * market.modal;
      const commission = afterSpoilage * costs.commission / 100;
      const transport = Number(market.transport ?? costs.transport);
      const net = afterSpoilage - transport - Number(costs.loading) - Number(costs.unloading) - commission - Number(costs.other);
      return { ...market, net, gross: quantity * market.modal, transport, commission, afterSpoilage };
    }).sort((a,b) => b.net - a.net);
  }, [apiPrices, cropCode, crop.price, costs, district, quantity]);
  const best = options[0];
  const selectedEstimate = selectedTransportMarket ? options.find(market => market.id === selectedTransportMarket.id || market.name === selectedTransportMarket.name) : null;
  const outlookMarket = selectedTransportMarket || (best ? {id:best.id,name:best.name} : null);
  useEffect(() => { let active=true; setOutlookData(null); setOutlookError(''); if(!outlookMarket){setOutlookLoading(false);return ()=>{active=false;};} setOutlookLoading(true); api.recommendation({cropCode,marketId:outlookMarket.id,marketName:outlookMarket.name,district}).then(result=>{if(!active)return;if(result?.error)setOutlookError(result.error);else setOutlookData(result);setOutlookLoading(false);}).catch(error=>{if(!active)return;setOutlookError(error.message||'Could not load the selling outlook.');setOutlookLoading(false);}); return ()=>{active=false;}; }, [cropCode,district,outlookMarket?.id,outlookMarket?.name]);
  const remainingTransportCapacity = transportMatch?.vehicle ? Math.max(0, Number(transportMatch.vehicle.capacityQuintals)-Number(transportMatch.totalQuantityQuintals||0)) : 0;

  async function refreshPrices(code = cropCode) { setPriceLoading(true); setComparisonComplete(false); setShowAll(false); const result = await api.prices(code); if (result?.prices) { setApiPrices(result); const places=[...new Set(result.prices.map(price=>price.district).filter(Boolean))].sort(); setAvailableDistricts(places); setDistrict(current=>places.includes(current)?current:(places[0]||'')); setPriceError(''); setComparisonComplete(true); } else setPriceError(result?.error || 'Could not load market prices from the API.'); setPriceLoading(false); }
  function selectCrop(code) { setCropCode(code); }
  function navigate(label) { setActiveNav(label); if(label==='Transport'&&!selectedTransportMarket&&options.length){const market=options.find(item=>item.dataMode==='DEMO')||options[0];selectTransportMarket(market);} const targets={Overview:'#top',Markets:'#market-section',Transport:'#transport-panel',Storage:'.storage-panel',Outlook:'.outlook-panel'}; document.querySelector(targets[label])?.scrollIntoView({behavior:'smooth',block:'start'}); }
  function selectTransportMarket(market) { setSelectedTransportMarket({id:market.id,name:market.name}); setActiveNav('Transport'); document.getElementById('transport-panel')?.scrollIntoView({behavior:'smooth',block:'start'}); }
  function openJoinForm() { setFarmerForm({farmerName:'',phoneNumber:'',quantityQuintals:'',pickupPlace:'',destinationMarket:transportMatch?.destinationMarket||''}); setJoinFormOpen(true); setJoinStatus(''); }
  async function submitJoinRequest(event) {
    event.preventDefault();
    if (!transportMatch?.groupId) return;
    const quantity=Number(farmerForm.quantityQuintals);
    const remaining=remainingTransportCapacity;
    if(!Number.isFinite(quantity)||quantity<=0){setJoinStatus('Enter a quantity greater than zero.');return;}
    if(quantity>remaining){setJoinStatus(`Please provide quintals less than or equal to ${remaining} qtl.`);return;}
    setJoinSubmitting(true);
    const result=await api.joinTransport(transportMatch.groupId,{...farmerForm,quantityQuintals:quantity});
    if(result?.status==='REQUESTED'){setJoinStatus('Join request added temporarily.');setJoinFormOpen(false);const updated=await api.matches(cropCode,selectedTransportMarket?.id || 'market-a');if(updated?.requests)setTransportMatch(updated);}
    else setJoinStatus(result?.error||'Could not send join request.');
    setJoinSubmitting(false);
  }
  function handleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    setVoiceText('');
    let startErrorReceived = false;
    const recognition = listen(language, {
      onResult: text => {
        recognitionRef.current = null;
        setListening(false);
        setVoiceText(text);
        const parsed = parseIntent(text);
        if (!parsed) {
          setVoiceMessage(t.voiceHelp);
          speak(t.voiceHelp, language);
          return;
        }

        if (parsed.cropCode) selectCrop(parsed.cropCode);
        if (parsed.quantityQuintals) setQuantity(parsed.quantityQuintals);
        let response = t.voiceHelp;
        if (parsed.intent === 'GET_PRICE' || parsed.intent === 'COMPARE_MARKETS') {
          refreshPrices(parsed.cropCode || cropCode);
          navigate('Markets');
          response = parsed.intent === 'COMPARE_MARKETS' ? t.compare : t.showing;
        } else if (parsed.intent === 'SHARED_TRANSPORT') {
          navigate('Transport');
          response = t.shared;
        } else if (parsed.intent === 'STORAGE') {
          navigate('Storage');
          response = t.storageTitle;
        } else if (parsed.intent === 'SELL_OR_WAIT') {
          navigate('Outlook');
          response = t.recommendation;
        } else if (parsed.intent === 'CALCULATE_NET') {
          document.querySelector('.profit-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          response = t.net;
        } else if (parsed.intent === 'SET_QUANTITY') {
          response = `${parsed.quantityQuintals} ${t.quintals}`;
        } else if (parsed.intent === 'SELECT_CROP') {
          const selectedCrop = crops.find(item => item.code === parsed.cropCode);
          response = selectedCrop ? `${language === 'kn' ? selectedCrop.kn : selectedCrop.en} selected.` : t.choose;
        }
        setVoiceMessage(response);
        speak(response, language);
      },
      onError: error => {
        startErrorReceived = true;
        recognitionRef.current = null;
        setListening(false);
        const messages = {
          'not-allowed': 'voicePermission',
          'service-not-allowed': 'voicePermission',
          'no-speech': 'voiceNoSpeech',
          network: 'voiceNetwork'
        };
        const fallbackMessages = {
          'not-allowed': 'Allow microphone access in your browser, then try again.',
          'service-not-allowed': 'Allow microphone access in your browser, then try again.',
          'no-speech': 'I did not hear anything. Try speaking again.',
          network: 'Speech recognition needs a network connection. Check your connection and try again.'
        };
        setVoiceMessage(t[messages[error]] || fallbackMessages[error] || 'Voice input failed. Please try again.');
      },
      onEnd: () => {
        recognitionRef.current = null;
        setListening(false);
      }
    });

    if (!recognition) {
      if (!startErrorReceived) setVoiceMessage(t.voiceUnsupported);
      setListening(false);
      return;
    }
    recognitionRef.current = recognition;
    setListening(true);
    setVoiceMessage(t.voiceListening || 'Listening...');
  }  const updateCost = (key, value) => setCosts(prev => ({ ...prev, [key]: value }));
  const outlookTrend = outlookData?.trend;
  const forecastDateLabel = formatForecastDate(outlookData?.forecast?.forecastDate);
  const trendUp = outlookTrend?.trend === 'INCREASING';
  const trendDown = outlookTrend?.trend === 'DECREASING';
  const outlookDecision = outlookData?.decision === 'CONSIDER_SELLING_NOW' ? 'Consider selling now' : outlookData?.decision === 'CONSIDER_WAITING_BRIEFLY' ? 'Consider waiting briefly' : outlookData?.decision === 'INSUFFICIENT_DATA' ? 'Not enough market data' : 'Monitor and recheck';
  const nav = [
    { label:'Overview', kn:'ಅವಲೋಕನ', icon:Wheat }, { label:'Markets', kn:'ಮಾರುಕಟ್ಟೆ', icon:MapPin }, { label:'Transport', kn:'ಸಾರಿಗೆ', icon:Truck }, { label:'Storage', kn:'ಸಂಗ್ರಹಣೆ', icon:Warehouse }, { label:'Outlook', kn:'ಮಾರಾಟದ ಸಲಹೆ', icon:TrendingUp }
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span className="brand-icon"><Sprout size={21}/></span><span><b>{t.brand}</b><small>FARMER MARKET COMPANION</small></span></a>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${activeNav===item.label?'active':''}`} onClick={()=>navigate(item.label)}><item.icon size={18}/><span>{language==='kn'?item.kn:item.label}</span>{item.label==='Markets'&&<span className="nav-count">3</span>}</button>)}</nav>
      <div className="sidebar-spacer"/>
      <div className="support-card"><div className="support-icon"><CircleHelp size={19}/></div><b>Need a hand?</b><p>Talk to your local agriculture extension officer for personalized support.</p><button onClick={()=>setVoiceMessage(t.disclaimer)}>Learn more <ArrowUpRight size={14}/></button></div>
      <div className="profile"><div className="avatar">RN</div><div><b>Ramesh N.</b><small>{language==='kn'?'ರಾಮನಗರ, ಕರ್ನಾಟಕ':'Ramanagara, Karnataka'}</small></div><ChevronDown size={16}/></div>
    </aside>
    <main className="main-area" id="top">
      <header className="topbar"><div className="crumb">RaithaMitra <ChevronRight size={14}/> <span>{language==='kn'?nav.find(n=>n.label===activeNav)?.kn:activeNav}</span></div><div className="top-actions"><div className="mode-pill"><i/> {apiPrices?.dataMode === 'MIXED' ? 'LIVE + SAMPLE' : apiPrices?.dataMode === 'LIVE' ? 'LIVE DATA' : apiPrices?.dataMode === 'DEMO' ? 'SAMPLE DATA' : 'MARKET DATA'}</div><button className="language-toggle" onClick={()=>setLanguage(language==='en'?'kn':'en')}><span>ಕನ್ನಡ</span><i/>EN</button><button className="icon-button" aria-label="Open menu"><Menu size={19}/></button></div></header>
      <div className="content-wrap">
        <MediatorBoard cropCode={crop.code} cropName={language==='kn'?crop.kn:crop.en} />
        
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/>{t.welcome}</div><h1>{t[greetingKey]}<span className="wave">✳</span></h1><p>{t.intro}</p></div><div className="local-date-card"><CalendarDays size={16}/><div><span>{t.today}</span><b>{localDateLabel}</b></div></div></section>
        <section className="hero-card"><div className="hero-copy"><div className="hero-kicker"><span/>YOUR NEXT GOOD DECISION STARTS HERE</div><h2>{language==='kn'?'ಸರಿಯಾದ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ.':'Find the right market.'}<br/><em>{language==='kn'?'ನಿಮ್ಮ ಬೆಳೆಗೆ.':'For your harvest.'}</em></h2><p>{t.marketSub}</p><div className="hero-actions"><button className={`mic-button ${listening?'listening':''}`} onClick={handleVoice}><Mic size={18}/>{listening?(language==='kn'?'ಕೇಳುತ್ತಿದ್ದೇನೆ':'Listening…'):t.speak}<span className="mic-wave">•••</span></button><button className="hero-secondary" onClick={()=>document.getElementById('crop-select')?.focus()}><Search size={17}/>{t.selectCrop}<ChevronRight size={16}/></button></div>{(voiceText||voiceMessage)&&<div className="voice-result"><Volume2 size={15}/><span>{voiceText || voiceMessage}</span></div>}<div className="voice-hint"><span className="sound-mark">◖</span>{t.voiceHelp}</div></div><div className="hero-art"><div className="sun-disc"/><div className="field field-back"/><div className="field field-mid"/><div className="field field-front"/><div className="plant plant-one">🌱</div><div className="plant plant-two">🌾</div><div className="art-note"><span><TrendingUp size={14}/></span><div><b>+4.2%</b><small>Tomato · 7 day trend</small></div></div><div className="art-note note-two"><span><MapPin size={14}/></span><div><b>3 nearby markets</b><small>Ready to compare</small></div></div><div className="cloud cloud-one"/><div className="cloud cloud-two"/></div></section>
        <section className="market-section" id="market-section"><div className="section-heading"><div><div className="eyebrow">YOUR HARVEST, YOUR CHOICE</div><h2>{t.markets}<span className="live-dot"/></h2><p>{comparisonComplete && best ? `${best.name} has the highest estimated net` : t.showing} <span className="date-inline"><Clock3 size={13}/> {t.now}</span></p></div><button className="text-link" onClick={()=>setShowAll(!showAll)}>{showAll?t.viewAll:'View all markets'} <ArrowUpRight size={15}/></button></div>
          <div className="filter-row"><label className="select-wrap crop-select-wrap"><span className={`crop-emoji ${crop.color}`}>{crop.emoji}</span><select id="crop-select" value={cropCode} onChange={e=>selectCrop(e.target.value)}>{crops.map(c=><option key={c.code} value={c.code}>{language==='kn'?c.kn:c.en}</option>)}</select><ChevronDown size={15}/></label><div className="filter-separator"/><label className="field-label"><MapPin size={15}/><select value={district} onChange={e=>setDistrict(e.target.value)} disabled={!availableDistricts.length}>{availableDistricts.map(place=><option key={place} value={place}>{place}</option>)}</select><ChevronDown size={14}/></label><div className="filter-separator"/><label className="qty-label"><span>{t.quantity}</span><input type="number" min="0.1" step="0.1" value={quantity} onChange={e=>setQuantity(Math.max(0, Number(e.target.value)))}/><small>qtl</small></label><button className="filter-button" onClick={()=>refreshPrices()}><Search size={16}/>{t.compare}</button></div>
          {priceError&&<div className="api-error">Market prices could not be loaded: {priceError}. Check that the backend is running on port 5000.</div>}{priceLoading&&<div className="api-loading">Loading {language==='kn'?crop.kn:crop.en} prices from the market API…</div>}
          <div className="market-grid">{!priceLoading && !priceError && options.length === 0 && <div className="api-loading">No market reports found for {district || 'Karnataka'} and {crop.en}.</div>}{options.slice(0,showAll?options.length:comparisonComplete?1:options.length).map((market,index)=><article className={`market-card ${index===0?'best-card':''}`} key={market.id}><div className="market-top"><div className="market-name-wrap"><span className={`market-icon market-icon-${index}`}><MapPin size={17}/></span><div><h3><button className="market-select" onClick={()=>selectTransportMarket(market)}>{market.name}</button></h3><span>{market.district} <span className="dot-sep">·</span> {market.distance} km</span></div></div>{index===0&&<span className="best-badge"><Check size={12}/> BEST NET</span>}</div><div className="price-date"><span><CalendarDays size={13}/>{market.date || '05 Nov 2026'}</span><span className="verified-text"><BadgeCheck size={13}/> {market.freshness || 'Latest reported'}</span></div><div className="modal-row"><div><span className="muted-label">{t.modal}</span><strong>{money(market.modal)}<small> / qtl</small></strong></div><div className="price-range"><span>{t.min} <b>{num(market.min)}</b></span><span>{t.max} <b>{num(market.max)}</b></span></div></div><div className="card-divider"/><div className="market-cost-row"><span>{t.transport}</span><b>{money(market.transport)}</b></div>{selectedTransportMarket?.id===market.id&&<div className="net-row"><span><span>{t.net}</span><small>{quantity} qtl · after estimated costs</small></span><b>{money(market.net)}</b></div>}<div className="card-footer"><span><span className="source-dot"/> {market.source || 'Demo price fixture'}</span><button onClick={()=>navigate('Markets')}>Details <ChevronRight size={14}/></button></div></article>)}</div>
          <div className="data-note"><span className="note-icon"><CircleHelp size={14}/></span><span></span><button onClick={()=>setVoiceMessage(t.disclaimer)}>How estimates work <ChevronRight size={14}/></button></div>
        </section>
        <section id="transport-panel" className="panel live-transport-panel"><div className="panel-heading"><div><div className="eyebrow">BETTER TOGETHER</div><h2>{t.shared}</h2></div><span className="soft-icon"><Truck size={18}/></span></div><p className="bottom-sub">Sample shared-transport matches for this crop and destination. Confirm availability before arranging a trip.</p>{transportError&&<div className="api-error">{transportError}</div>}{transportMatch ? <><div className="transport-match"><div className="match-count"><div className="avatar-stack">{transportMatch.requests.slice(0,3).map((request,index)=><span key={request.id}>{String.fromCharCode(65+index)}</span>)}</div><div><b>{transportMatch.requests.length} compatible requests</b><small>{transportMatch.requests.map(request=>`${request.quantityQuintals} qtl`).join(' + ') || 'No compatible farmers yet'}</small></div></div><span className="status-chip">{transportMatch.vehicle ? t.capacity : t.formGroup}</span></div><div className="transport-details"><div><small>Destination</small><b><MapPin size={13}/> {transportMatch.destinationMarket || 'Market unavailable'}</b></div><div><small>Group quantity</small><b>{transportMatch.totalQuantityQuintals} / {transportMatch.vehicle?.capacityQuintals || 20} qtl</b></div><div><small>Estimated vehicle cost</small><b>{transportMatch.vehicle ? money(transportMatch.vehicle.estimatedCost) : 'Not available'}</b></div></div><div className="farmer-list"><div className="farmer-list-heading"><b>Farmers sharing this trip</b><span>{transportMatch.requests.length} matched</span></div><div className="farmer-card-grid">{transportMatch.requests.map(request=><article className="farmer-detail" key={request.id}><div className="farmer-card-head"><span className="farmer-avatar">{(request.farmerName || 'Farmer').split(' ').map(part=>part[0]).join('').slice(0,2).toUpperCase()}</span><div><b>{request.farmerName || 'Demo farmer'}</b><small>{request.quantityQuintals ? `${request.quantityQuintals} qtl produce` : 'Join request'}</small></div></div><div className="farmer-meta"><div><small>Phone</small><span>{request.phoneNumber || 'Not provided'}</span></div><div><small>Pickup place</small><span>{request.pickupArea ? `${request.pickupArea}, ${request.pickupDistrict}` : request.pickupDistrict}</span></div></div><div className="farmer-cluster"><small>Transport cluster</small><b>{request.clusterName || 'Village cluster pending'}</b></div><div className="farmer-destination"><small>Taking produce to</small><b>{request.destinationMarket || transportMatch.destinationMarket || 'Selected market'}</b></div></article>)}</div></div>{transportMatch.vehicle&&<div className="transport-progress"><span style={{width:`${Math.min(100,transportMatch.totalQuantityQuintals/transportMatch.vehicle.capacityQuintals*100)}%`}}/></div>}<div className="transport-foot"><span>{transportMatch.message}</span><button disabled={!transportMatch.vehicle} onClick={openJoinForm}>{joinStatus || (transportMatch.vehicle?'Request to join':'No vehicle found')} <ChevronRight size={14}/></button></div>{joinFormOpen&&<form className="join-farmer-form" onSubmit={submitJoinRequest}><div className="join-form-heading"><b>Join the shared transport</b><span>Name and phone are visible on this site; request is stored in memory only</span></div><div className="join-form-grid"><label>Farmer name<input required maxLength="80" value={farmerForm.farmerName} onChange={event=>setFarmerForm({...farmerForm,farmerName:event.target.value})}/></label><label>Phone number<input required type="tel" inputMode="tel" pattern="[+0-9() -]{7,20}" title="Enter a phone number with 7 to 15 digits" value={farmerForm.phoneNumber} onChange={event=>setFarmerForm({...farmerForm,phoneNumber:event.target.value})}/></label><label>Quantity (quintals)<small className="capacity-hint">{remainingTransportCapacity} qtl available for {selectedTransportMarket?.name || transportMatch.destinationMarket}</small><input required type="number" min="0.1" step="0.1" value={farmerForm.quantityQuintals} onChange={event=>{setFarmerForm({...farmerForm,quantityQuintals:event.target.value});setJoinStatus('');}}/></label><label>Pickup place<input required maxLength="120" placeholder="Enter your village or pickup area" value={farmerForm.pickupPlace} onChange={event=>setFarmerForm({...farmerForm,pickupPlace:event.target.value})}/></label><label>Taking the product to<input required maxLength="120" value={farmerForm.destinationMarket} onChange={event=>setFarmerForm({...farmerForm,destinationMarket:event.target.value})}/></label></div>{joinStatus&&<div className="join-form-error" role="alert">{joinStatus}</div>}<div className="join-form-actions"><button type="button" onClick={()=>setJoinFormOpen(false)}>Cancel</button><button type="submit" disabled={joinSubmitting}>{joinSubmitting?'Sending...':'Submit join request'}</button></div></form>}{transportMatch.estimatedShares?.length>0&&<div className="share-list"><b>Estimated proportional shares</b>{transportMatch.estimatedShares.map((share,index)=><span key={share.requestId}>Farmer {String.fromCharCode(65+index)} · {share.quantityQuintals} qtl <strong>{money(share.estimatedShare)}</strong></span>)}</div>}</> : <div className="api-loading">Loading transport matches…</div>}</section>
        <div className="dashboard-grid"><section className="panel profit-panel"><div className="panel-heading"><div><div className="eyebrow">CLEAR COSTS, CLEARER CHOICES</div><h2>What could you take home?</h2></div><span className="estimate-pill"><Leaf size={13}/> ESTIMATE</span></div>{!selectedEstimate?<div className="api-loading">Click a market name above to calculate its estimated take-home amount.</div>:<><p className="panel-sub">A simple breakdown for <b>{quantity} quintals of {language==='kn'?crop.kn:crop.en}</b> at {selectedEstimate.name}.</p><div className="profit-body"><div className="profit-chart"><div className="donut" style={{'--net':`${Math.max(12, Math.min(88, selectedEstimate.net / Math.max(1,selectedEstimate.gross) * 100))}%`}}><div><span>EST. NET</span><b>{money(selectedEstimate.net)}</b></div></div><div className="chart-legend"><span><i className="legend-net"/>Take-home estimate <b>{Math.round(selectedEstimate.net/selectedEstimate.gross*100)}%</b></span><span><i className="legend-cost"/>Costs & loss <b>{Math.round((selectedEstimate.gross-selectedEstimate.net)/selectedEstimate.gross*100)}%</b></span></div></div><div className="breakdown"><div className="breakdown-line"><span>Gross crop value</span><b>{money(selectedEstimate.gross)}</b></div><div className="breakdown-line deduction"><span><i/> Transportation</span><b>− {money(selectedEstimate.transport)}</b></div><div className="breakdown-line deduction"><span><i/> Loading & unloading</span><b>− {money(Number(costs.loading)+Number(costs.unloading))}</b></div><div className="breakdown-line deduction"><span><i/> Commission ({costs.commission}%)</span><b>− {money(selectedEstimate.commission)}</b></div><div className="breakdown-line deduction"><span><i/> Spoilage ({costs.spoilage}%)</span><b>− {money(selectedEstimate.gross-selectedEstimate.afterSpoilage)}</b></div><div className="breakdown-line deduction"><span><i/> Other expenses</span><b>− {money(costs.other)}</b></div><div className="breakdown-total"><span>Estimated net amount</span><b>{money(selectedEstimate.net)}</b></div></div></div><details className="edit-costs"><summary>Edit cost assumptions <ChevronDown size={14}/></summary><div className="cost-input-grid">{[['loading','Loading ₹'],['unloading','Unloading ₹'],['commission','Commission %'],['other','Other costs ₹'],['spoilage','Spoilage %']].map(([key,label])=><label key={key}>{label}<input type="number" min="0" value={costs[key]} onChange={e=>updateCost(key,e.target.value)}/></label>)}</div><small>Estimated defaults shown. Update with quotes from your local market.</small></details></>}</section>
          <section className="panel outlook-panel"><div className="panel-heading"><div><div className="eyebrow">A HELPFUL SIGNAL, NOT A PROMISE</div><h2>{t.recommendation}</h2></div><span className="signal-icon"><TrendingUp size={18}/></span></div>{!outlookMarket?<div className="api-loading">Market-based outlook for the best estimated net value.</div>:outlookLoading?<div className="api-loading">Loading outlook for {outlookMarket.name}�</div>:outlookError?<div className="api-error">{outlookError}</div>:outlookData&&<><div className="outlook-crop"><span className="crop-round">{crop.emoji}</span><div><b>{language==='kn'?crop.kn:crop.en} outlook</b><small>{outlookData.market || outlookMarket.name} � {outlookData.district || district}</small></div><span className={`trend-pill ${trendUp?'up':trendDown?'down':''}`}>{trendUp?<TrendingUp size={13}/>:trendDown?<TrendingDown size={13}/>:<Minus size={13}/>} {outlookTrend?.changePercent==null?'Insufficient data':`${outlookTrend.changePercent>0?'+':''}${outlookTrend.changePercent}%`}</span></div><div className="outlook-price"><div><span>Current modal price</span><b>{outlookData.currentPrice==null?'Unavailable':money(outlookData.currentPrice)} <small>/ qtl</small></b></div><div className="outlook-report"><span>Latest report</span><b><CalendarDays size={12}/>{outlookData.reportDate || 'Unavailable'}</b></div></div>{outlookData.forecast?.estimatedModalPrice!=null&&<div className="forecast-strip"><div><span>Next-day modal estimate</span><b>{money(outlookData.forecast.estimatedModalPrice)} <small>/ qtl</small></b></div><div><span>Forecast date</span><b>{forecastDateLabel}</b></div><small>Illustrative estimate from recent demo prices � low confidence</small></div>}<div className="trend-callout"><span className="trend-icon">{trendUp?<TrendingUp size={16}/>:trendDown?<TrendingDown size={16}/>:<Minus size={16}/>}</span><div><b>{trendUp?'Prices have been moving up':trendDown?'Prices have been moving down':'Market trend unavailable'}</b><p>Based on {outlookData.observationCount} demo observations for {outlookData.market || outlookMarket.name}.</p></div></div><div className="outlook-result"><div className="outlook-result-icon"><Clock3 size={16}/></div><div><b>{outlookDecision}</b><p>{outlookData.reasons?.join(' ') || outlookData.disclaimer}</p></div></div><div className="observation-foot"><span><span className="source-dot"/> {outlookData.observationCount} observations <span className="dot-sep">�</span> {outlookData.market || outlookMarket.name}</span><span className="low-confidence">{outlookData.confidence || 'LOW'} CONFIDENCE</span></div></>}</section></div>
        <div className="bottom-grid"><section className="panel transport-panel"><div className="panel-heading"><div><div className="eyebrow">BETTER TOGETHER</div><h2>{t.shared}</h2></div><span className="soft-icon"><Truck size={18}/></span></div><p className="bottom-sub">Share a ride to the same market and make each trip go further.</p><div className="transport-match"><div className="match-count"><div className="avatar-stack"><span>SK</span><span>MP</span><span>+</span></div><div><b>2 farmers nearby</b><small>Open to join · same destination</small></div></div><span className="status-chip">{t.formGroup}</span></div><div className="transport-details"><div><small>Destination</small><b><MapPin size={13}/> Yeshwanthpur APMC</b></div><div><small>Group quantity</small><b>13 / 20 qtl</b></div><div><small>Your estimated share</small><b>{money(577)}</b></div></div><div className="transport-progress"><span style={{width:'65%'}}/></div><div className="transport-foot"><span>Capacity target: 20 qtl <span className="dot-sep">·</span> ₹2,300 vehicle estimate</span><button onClick={()=>setActiveNav('Transport')}>View group <ChevronRight size={14}/></button></div></section>
          <section className="panel storage-panel"><div className="panel-heading"><div><div className="eyebrow">A PLAN B FOR YOUR HARVEST</div><h2>{t.storageTitle}</h2></div><span className="storage-icon"><Warehouse size={18}/></span></div><div className="storage-list">{storageLoading?<div className="api-loading">Finding storage near {district}...</div>:storageError?<div className="api-error">{storageError}</div>:storageListings.length?storageListings.map(facility=><article className="storage-card" key={facility.id}><div className="storage-top"><span className="storage-emoji"><Warehouse size={16}/></span><span className="storage-available">AVAILABLE</span></div><h3>{facility.name}</h3><p><MapPin size={13}/>{facility.locationText} &middot; {facility.distanceKm} km away</p><div className="storage-specs"><span><b>{facility.availableCapacityQuintals} qtl</b><small>available of {facility.capacityQuintals} qtl</small></span><span><b>&#8377;{facility.costPerQuintalPerDay} <small>/ qtl / day</small></b><small>storage cost</small></span><span><b>{language==='kn'?crop.kn:crop.en}</b><small>crop suitability</small></span></div><div className="storage-note"><CircleHelp size={13}/> Demo listing. Confirm availability and charges directly before making plans.</div><button className="storage-select-button" type="button" onClick={()=>setSelectedStorageId(selectedStorageId===facility.id?'':facility.id)}>{selectedStorageId===facility.id?'Hide details':'Select storage'}</button>{selectedStorageId===facility.id&&<div className="storage-contact-details"><b>Storage owner contact <small>DEMO DETAILS</small></b><div><span>Mobile</span><a href={'tel:'+facility.ownerPhone}>{facility.ownerPhone}</a></div><div><span>Email</span><a href={'mailto:'+facility.ownerEmail}>{facility.ownerEmail}</a></div><div className="storage-full-address"><span>Complete address</span><address>{facility.fullAddress}</address></div><small>Demo contact and address. Confirm details before traveling.</small></div>}</article>):<div className="api-loading">No nearby storage listing in {district} supports {language==='kn'?crop.kn:crop.en}.</div>}</div><button className="storage-link" onClick={()=>setActiveNav('Storage')}>Explore storage options <ArrowUpRight size={15}/></button></section></div>
        <footer className="footer"><span><Sprout size={15}/> RaithaMitra <span className="footer-dot">·</span> Made for the people who feed us</span><span>Market data is informational. Confirm prices and terms locally.</span></footer>
      </div>
    </main>
  </div>;
}
