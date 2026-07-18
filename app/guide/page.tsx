"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  CircleHelp,
  Clock3,
  Heart,
  Home,
  Info,
  MapPin,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/app/app-provider";
import { PropertyCard } from "@/components/property-card";
import { compactPeso, maxAffordablePrice, peso } from "@/lib/finance";
import { listings } from "@/lib/listings";
import { DEFAULT_GUIDE_ANSWERS, filterListingsForGuide, getFilterImpacts, getRelaxationSuggestions, rankListings } from "@/lib/matching";
import type { AreaGroup, Language, MoveInTiming, Priority, PropertyType } from "@/lib/types";

const areas: AreaGroup[] = ["Metro Manila", "Rizal", "Cavite", "Laguna", "Bulacan"];

const propertyTypes: Array<{ value: PropertyType; label: Record<Language, string>; description: Record<Language, string> }> = [
  { value: "condo", label: { en: "Condo", fil: "Condo" }, description: { en: "Often closer to the city. Buildings may have shared fees and spaces.", fil: "Madalas mas malapit sa siyudad. Maaaring may bayad at espasyong pinagsasaluhan." } },
  { value: "townhouse", label: { en: "Townhouse", fil: "Townhouse" }, description: { en: "More room than many condos, with a shared wall and a smaller lot.", fil: "Mas maluwag kaysa maraming condo, may katabing pader at mas maliit na lote." } },
  { value: "house", label: { en: "Detached house", fil: "Sariling bahay" }, description: { en: "More private space, but it may be farther from city centers.", fil: "Mas pribado at maluwag, pero maaaring mas malayo sa sentro ng siyudad." } },
];

const priorities: Array<{ value: Priority; label: Record<Language, string> }> = [
  { value: "space", label: { en: "More space", fil: "Mas maluwag" } },
  { value: "parking", label: { en: "Parking", fil: "Paradahan" } },
  { value: "accessibility", label: { en: "Easy access", fil: "Madaling daanan" } },
  { value: "transit", label: { en: "Public transport", fil: "Pampublikong sakayan" } },
  { value: "quiet", label: { en: "A quiet area", fil: "Tahimik na lugar" } },
  { value: "proximity", label: { en: "Near daily needs", fil: "Malapit sa pang-araw-araw" } },
];

const timingOptions: Array<{ value: MoveInTiming; label: Record<Language, string>; body: Record<Language, string> }> = [
  { value: "ready", label: { en: "As soon as possible", fil: "Sa lalong madaling panahon" }, body: { en: "Put ready homes first.", fil: "Unahin ang mga bahay na handa na." } },
  { value: "within-year", label: { en: "Within one year", fil: "Sa loob ng isang taon" }, body: { en: "Show ready and nearly finished homes.", fil: "Ipakita ang handa at malapit nang matapos na bahay." } },
  { value: "pre-selling", label: { en: "I can wait longer", fil: "Maaari akong maghintay" }, body: { en: "Include homes that are still being built.", fil: "Isama ang mga bahay na ginagawa pa." } },
];

const stepVisuals = [
  { image: "/images/kubo-guide-budget.webp", icon: Calculator, alt: "Kubo thinking with a wooden calculator" },
  { image: "/images/kubo-guide-location.webp", icon: MapPin, alt: "Kubo exploring a map" },
  { image: "/images/kubo-guide-family.webp", icon: Users, alt: "Kubo listening to a family" },
  { image: "/images/kubo-guide-types.webp", icon: Home, alt: "Kubo comparing three home types" },
  { image: "/images/kubo-guide-timing.webp", icon: Clock3, alt: "Kubo planning with a clock and calendar" },
  { image: "/images/kubo-guide-celebrate.webp", icon: Heart, alt: "Kubo celebrating the family's priorities" },
] as const;

const guideCopy = {
  en: {
    eyebrow: "Chat with Kubo",
    title: "Let’s find a home that works for your family.",
    intro: "Kubo will ask six short questions. Go back or change an answer at any time.",
    disclaimer: "The fit score compares your answers with available homes. It does not rate home quality or give financial advice.",
    step: "Question",
    of: "of",
    path: "Your home-fit journey",
    choices: "Your answers so far",
    rankingOnly: "This answer changes order, not the number of homes.",
    homesAfter: "homes after this answer",
    homesRemain: "homes still fit",
    homesWord: "homes",
    perMonth: "per month",
    impactLabels: ["Budget", "Areas", "Bedrooms", "Home types", "Move-in time", "Family priorities"],
    remove: "Change this answer",
    restart: "Start again",
    back: "Back",
    next: "Next question",
    results: "See my matches",
    steps: [
      { mood: "Planning with you", title: "What monthly payment feels safe?", body: "Choose an amount that leaves room for food, school, savings, and surprises.", speech: "You do not need to share your income or debts. Just choose an amount that feels safe for your family." },
      { mood: "Exploring places", title: "Where could daily life work?", body: "Choose only the places your family would really consider.", speech: "I will keep your chosen areas as firm limits. I will never add another area without asking you." },
      { mood: "Listening closely", title: "How much room do you need?", body: "Count the people who will live in the home most of the time.", speech: "There is no perfect family size. Tell me what your household needs so I can remove homes that are too small." },
      { mood: "Comparing choices", title: "Which home types are okay for you?", body: "Pick every type your family would honestly consider.", speech: "Each home type has trade-offs. It is okay to keep several choices open while we compare them." },
      { mood: "Planning your timing", title: "When would you like to move?", body: "This answer changes which homes rank higher. It does not remove homes.", speech: "A ready home may be faster. A home still being built may give you more time to prepare. Choose what feels practical." },
      { mood: "Learning what matters", title: "What matters most each day?", body: "Pick up to three. I will use them to rank your matches.", speech: "Last question! Pick the things that would make daily family life easier. There is no wrong choice." },
    ],
    monthly: "Monthly housing budget",
    monthlyHelp: "The amount you feel comfortable paying for housing each month. This is not the highest amount a lender may offer.",
    typeAmount: "Or type the amount",
    sliderLow: "₱10,000",
    sliderHigh: "₱300,000",
    cash: "Cash ready for a down payment",
    cashHelp: "A down payment is money paid at the start. A larger down payment usually means a smaller loan. Lender rules can still differ.",
    ceiling: "Estimated home-price limit",
    ceilingHelp: "This rough limit uses your monthly budget, cash, interest, and loan length. It is not a lender offer.",
    estimateNote: "Example estimate: 7% interest for 20 years. Taxes, insurance, building fees, and other buying costs are not included.",
    areas: "Areas you would consider",
    commute: "Place you often travel to",
    commuteHelp: "Choose a work, school, or city area you visit often. Kubo uses the estimated travel time only to rank homes.",
    maxCommute: "Longest estimated travel time",
    minutes: "minutes",
    household: "People in the household",
    people: "people",
    person: "person",
    bedrooms: "Minimum bedrooms",
    bedroomsHelp: "This is a firm limit. Homes with fewer bedrooms will be removed.",
    homeTypes: "Home types",
    timing: "Move-in timing",
    familyPriorities: "Family priorities",
    prioritiesHelp: "These choices only change the order of your matches. They do not remove a home.",
    retained: "of 48 homes fit your firm limits",
    matchesTitle: "Here are your strongest matches.",
    matchesBody: "Your rough price limit is",
    zeroTitle: "No homes match every firm limit yet.",
    zeroBody: "I did not change your answers. Try one small change below and see exactly how many homes return.",
    apply: "Apply only this change",
    scoreTitle: "How the 100-point fit score works",
    scoreBody: "Location and travel 30 · budget comfort 25 · space 15 · timing 10 · parking and easy access 10 · family priorities 10.",
    relaxBudget: "Raise the rough price limit by 10%",
    relaxBedrooms: "Try one fewer bedroom",
    relaxAreas: "Include all pilot areas",
    celebration: "Nice work! I kept your firm limits and ranked only the homes that passed them.",
  },
  fil: {
    eyebrow: "Makipag-usap kay Kubo",
    title: "Hanapin natin ang bahay na uubra sa pamilya ninyo.",
    intro: "Anim na maikling tanong lang. Maaari kayong bumalik o magpalit ng sagot kahit kailan.",
    disclaimer: "Inihahambing lang ng fit score ang sagot ninyo sa mga bahay. Hindi ito marka ng kalidad o payong pinansyal.",
    step: "Tanong",
    of: "sa",
    path: "Paglalakbay sa bagay na bahay",
    choices: "Mga sagot ninyo",
    rankingOnly: "Binabago lang nito ang ayos, hindi ang dami ng bahay.",
    homesAfter: "bahay matapos ang sagot na ito",
    homesRemain: "bahay ang pasok pa",
    homesWord: "bahay",
    perMonth: "bawat buwan",
    impactLabels: ["Badyet", "Mga lugar", "Mga kuwarto", "Uri ng bahay", "Oras ng paglipat", "Mahalaga sa pamilya"],
    remove: "Baguhin ang sagot na ito",
    restart: "Magsimula ulit",
    back: "Bumalik",
    next: "Susunod na tanong",
    results: "Tingnan ang tugma",
    steps: [
      { mood: "Nagpaplano kasama ninyo", title: "Anong buwanang bayad ang komportable?", body: "Pumili ng halagang may matitira pa para sa pagkain, paaralan, ipon, at biglaang gastos.", speech: "Hindi ninyo kailangang ibigay ang kita o utang. Pumili lang ng halagang ligtas para sa pamilya." },
      { mood: "Tinitingnan ang mga lugar", title: "Saan uubra ang araw-araw na buhay?", body: "Piliin lang ang mga lugar na tunay ninyong ikokonsidera.", speech: "Gagawin kong mahigpit na limitasyon ang napiling lugar. Hindi ako magdadagdag nang hindi kayo tinatanong." },
      { mood: "Nakikinig nang mabuti", title: "Gaano kaluwag ang kailangan ninyo?", body: "Bilangin ang mga taong madalas titira sa bahay.", speech: "Walang perpektong laki ng pamilya. Sabihin ang kailangan ninyo para maalis ko ang mga bahay na masyadong maliit." },
      { mood: "Naghahambing ng pagpipilian", title: "Anong uri ng bahay ang puwede sa inyo?", body: "Piliin ang lahat ng uri na talagang ikokonsidera ng pamilya.", speech: "May kapalit ang bawat uri ng bahay. Ayos lang na manatiling bukas sa ilang pagpipilian habang naghahambing." },
      { mood: "Pinaplano ang oras", title: "Kailan ninyo gustong lumipat?", body: "Binabago nito kung alin ang mas mataas sa listahan. Walang bahay na inaalis.", speech: "Mas mabilis ang handa nang bahay. Mas mahaba ang paghahanda kung ginagawa pa ito. Piliin ang praktikal para sa inyo." },
      { mood: "Inaalam ang mahalaga", title: "Ano ang pinakamahalaga araw-araw?", body: "Pumili ng hanggang tatlo. Gagamitin ko ito sa pag-ayos ng mga tugma.", speech: "Huling tanong! Piliin ang makapagpapadali sa buhay ng pamilya. Walang maling sagot." },
    ],
    monthly: "Buwanang badyet sa bahay",
    monthlyHelp: "Halagang komportable ninyong bayaran bawat buwan. Hindi ito ang pinakamataas na maaaring ialok ng bangko.",
    typeAmount: "O i-type ang halaga",
    sliderLow: "₱10,000",
    sliderHigh: "₱300,000",
    cash: "Cash para sa down payment",
    cashHelp: "Ang down payment ay perang binabayaran sa simula. Karaniwang mas maliit ang uutangin kapag mas malaki ito. Magkakaiba pa rin ang patakaran ng bangko.",
    ceiling: "Tinatayang limitasyon sa presyo",
    ceilingHelp: "Ginagamit ng tantiyang ito ang buwanang badyet, cash, interes, at haba ng loan. Hindi ito alok ng bangko.",
    estimateNote: "Halimbawang estimate: 7% interes sa loob ng 20 taon. Hindi kasama ang buwis, insurance, building fees, at ibang gastos sa pagbili.",
    areas: "Mga lugar na ikokonsidera",
    commute: "Lugar na madalas puntahan",
    commuteHelp: "Pumili ng trabaho, paaralan, o lugar sa siyudad na madalas puntahan. Tinatayang travel time lang ang gamit sa pag-ayos ng bahay.",
    maxCommute: "Pinakamahabang tinatayang travel time",
    minutes: "minuto",
    household: "Mga tao sa bahay",
    people: "tao",
    person: "tao",
    bedrooms: "Pinakamababang bilang ng kuwarto",
    bedroomsHelp: "Mahigpit itong limitasyon. Aalisin ang bahay na kulang sa kuwarto.",
    homeTypes: "Uri ng bahay",
    timing: "Oras ng paglipat",
    familyPriorities: "Mahalaga sa pamilya",
    prioritiesHelp: "Binabago lang nito ang ayos ng mga tugma. Walang bahay na inaalis.",
    retained: "sa 48 bahay ang pasok sa mahigpit na limitasyon",
    matchesTitle: "Narito ang pinakamalalakas na match.",
    matchesBody: "Ang tinatayang limitasyon sa presyo ay",
    zeroTitle: "Walang bahay na pasok sa lahat ng mahigpit na limitasyon.",
    zeroBody: "Hindi ko binago ang sagot ninyo. Subukan ang isang maliit na pagbabago at tingnan kung ilang bahay ang babalik.",
    apply: "Ito lang ang baguhin",
    scoreTitle: "Paano gumagana ang 100-point fit score",
    scoreBody: "Lugar at biyahe 30 · ginhawa sa badyet 25 · espasyo 15 · oras ng paglipat 10 · paradahan at madaling daan 10 · mahalaga sa pamilya 10.",
    relaxBudget: "Taasan nang 10% ang tinatayang limitasyon",
    relaxBedrooms: "Subukan ang isang kuwartong mas kaunti",
    relaxAreas: "Isama ang lahat ng pilot area",
    celebration: "Mahusay! Pinanatili ko ang mahigpit ninyong limitasyon at inayos lang ang mga bahay na pumasa.",
  },
} as const;

function HelpTip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <span className="help-tip">
      <button type="button" aria-label={label} aria-describedby={id}><CircleHelp size={17} /></button>
      <span id={id} role="tooltip" className="help-popover">{children}</span>
    </span>
  );
}

function PesoField({ label, help, value, onChange, min, max, step, slider, typeAmount, perMonth }: {
  label: string;
  help: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  slider?: boolean;
  typeAmount: string;
  perMonth: string;
}) {
  const id = useId();
  const safeSliderValue = Math.min(max, Math.max(min, value));
  const formatted = value ? new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(value) : "";
  const updateTypedValue = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    onChange(digits ? Math.min(max, Number(digits)) : 0);
  };

  return (
    <div className={`money-control${slider ? " with-slider" : ""}`}>
      <div className="field-heading"><span>{label}</span><HelpTip label={`${label}: help`}>{help}</HelpTip></div>
      {slider && <>
        <div className="range-value" aria-hidden="true">{peso(safeSliderValue)} <span>/ {perMonth}</span></div>
        <input
          className="budget-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeSliderValue}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={`${label} slider`}
          aria-valuetext={peso(safeSliderValue)}
        />
        <div className="range-ends" aria-hidden="true"><span>₱10,000</span><span>₱300,000</span></div>
      </>}
      <label className="typed-amount-label" htmlFor={`${id}-amount`}>{slider ? typeAmount : label}</label>
      <div className="currency-input"><span aria-hidden="true">₱</span><input id={`${id}-amount`} aria-label={label} type="text" inputMode="numeric" pattern="[0-9,]*" value={formatted} onChange={(event) => updateTypedValue(event.target.value)} onBlur={() => { if (value < min) onChange(min); }} /></div>
    </div>
  );
}

export default function GuidePage() {
  const { guideAnswers, setGuideAnswers, language } = useApp();
  const copy = guideCopy[language];
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const filtered = useMemo(() => filterListingsForGuide(listings, guideAnswers, completedSteps), [guideAnswers, completedSteps]);
  const preview = useMemo(() => filterListingsForGuide(listings, guideAnswers, Math.min(6, Math.max(completedSteps, step + 1))), [guideAnswers, completedSteps, step]);
  const impacts = useMemo(() => getFilterImpacts(listings, guideAnswers, completedSteps), [guideAnswers, completedSteps]);
  const matches = useMemo(() => rankListings(listings, guideAnswers), [guideAnswers]);
  const toggleArray = <T,>(items: T[], value: T) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
  const advance = () => {
    setCompletedSteps((current) => Math.max(current, step + 1));
    setStep((current) => Math.min(6, current + 1));
  };
  const restart = () => { setGuideAnswers(DEFAULT_GUIDE_ANSWERS); setCompletedSteps(0); setStep(0); };
  const countBefore = filterListingsForGuide(listings, guideAnswers, Math.min(step, completedSteps)).length;
  const hardStep = step < 4;
  const activeVisual = stepVisuals[Math.min(step, 5)];
  const ActiveIcon = activeVisual.icon;

  return (
    <div className="guide-page page-shell">
      <header className="guide-hero">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <small><Info size={15} />{copy.disclaimer}</small>
      </header>

      {step < 6 ? (
        <div className="guide-game-shell">
          <aside className="kubo-companion" aria-label="Kubo guide">
            <div className="kubo-mood"><Sparkles size={15} />{copy.steps[step].mood}</div>
            <div className="kubo-stage">
              <Image key={activeVisual.image} src={activeVisual.image} alt={activeVisual.alt} width={900} height={900} className="kubo-behavior" priority={step === 0} unoptimized />
            </div>
            <div className="kubo-speech">
              <span>Kubo</span>
              <p>{copy.steps[step].speech}</p>
            </div>
            <div className="kubo-count" aria-live="polite">
              <strong>{hardStep ? `${countBefore} → ${preview.length}` : filtered.length}</strong>
              <span>{hardStep ? copy.homesAfter : copy.homesRemain}</span>
              {!hardStep && <small>{copy.rankingOnly}</small>}
            </div>
          </aside>

          <div className="guide-play-area">
            <nav className="guide-path" aria-label={copy.path}>
              <div className="guide-path-heading"><span>{copy.path}</span><strong>{copy.step} {step + 1} {copy.of} 6</strong></div>
              <ol>
                {stepVisuals.map((visual, index) => {
                  const StepIcon = visual.icon;
                  const available = index <= Math.max(step, completedSteps);
                  return <li key={visual.image} className={index === step ? "current" : index < completedSteps ? "done" : ""}><button type="button" disabled={!available} aria-label={`${copy.step} ${index + 1}: ${copy.steps[index].title}`} aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)}>{index < completedSteps ? <Check size={16} /> : <StepIcon size={16} />}</button></li>;
                })}
              </ol>
            </nav>

            <section className="question-card" aria-labelledby="question-title">
              <div className="question-heading"><div className="question-icon"><ActiveIcon /></div><div><span>{copy.step} {step + 1}</span><h2 id="question-title">{copy.steps[step].title}</h2><p>{copy.steps[step].body}</p></div></div>

              {step === 0 && <>
                <div className="budget-controls">
                  <PesoField label={copy.monthly} help={copy.monthlyHelp} value={guideAnswers.monthlyBudget} onChange={(monthlyBudget) => setGuideAnswers((current) => ({ ...current, monthlyBudget }))} min={10_000} max={300_000} step={5_000} slider typeAmount={copy.typeAmount} perMonth={copy.perMonth} />
                  <PesoField label={copy.cash} help={copy.cashHelp} value={guideAnswers.cashAvailable} onChange={(cashAvailable) => setGuideAnswers((current) => ({ ...current, cashAvailable }))} min={0} max={20_000_000} step={50_000} typeAmount={copy.typeAmount} perMonth={copy.perMonth} />
                </div>
                <div className="assumption-box"><Info size={18} /><div><div className="assumption-heading"><strong>{copy.ceiling}: {compactPeso(maxAffordablePrice(guideAnswers))}</strong><HelpTip label={`${copy.ceiling}: help`}>{copy.ceilingHelp}</HelpTip></div><p>{copy.estimateNote}</p></div></div>
              </>}

              {step === 1 && <>
                <fieldset className="option-grid"><legend>{copy.areas}</legend>{areas.map((area) => <label className={`option-tile ${guideAnswers.areas.includes(area) ? "selected" : ""}`} key={area}><input type="checkbox" checked={guideAnswers.areas.includes(area)} onChange={() => setGuideAnswers((current) => ({ ...current, areas: toggleArray(current.areas, area) }))} /><span>{area}</span>{guideAnswers.areas.includes(area) && <Check size={18} />}</label>)}</fieldset>
                <div className="field-grid two"><label><span className="field-heading"><span>{copy.commute}</span><HelpTip label={`${copy.commute}: help`}>{copy.commuteHelp}</HelpTip></span><select value={guideAnswers.commuteAnchor} onChange={(event) => setGuideAnswers((current) => ({ ...current, commuteAnchor: event.target.value as typeof current.commuteAnchor }))}>{Object.keys(listings[0].commuteMinutes).map((anchor) => <option key={anchor}>{anchor}</option>)}</select></label><label>{copy.maxCommute}<select value={guideAnswers.maxCommute} onChange={(event) => setGuideAnswers((current) => ({ ...current, maxCommute: Number(event.target.value) }))}>{[30,45,60,90].map((minutes) => <option value={minutes} key={minutes}>{minutes} {copy.minutes}</option>)}</select></label></div>
              </>}

              {step === 2 && <div className="field-grid two"><label>{copy.household}<select value={guideAnswers.householdSize} onChange={(event) => setGuideAnswers((current) => ({ ...current, householdSize: Number(event.target.value) }))}>{[1,2,3,4,5,6,7,8].map((value) => <option value={value} key={value}>{value} {value === 1 ? copy.person : copy.people}</option>)}</select></label><label><span className="field-heading"><span>{copy.bedrooms}</span><HelpTip label={`${copy.bedrooms}: help`}>{copy.bedroomsHelp}</HelpTip></span><select value={guideAnswers.minBedrooms} onChange={(event) => setGuideAnswers((current) => ({ ...current, minBedrooms: Number(event.target.value) }))}>{[1,2,3,4,5].map((value) => <option value={value} key={value}>{value}+</option>)}</select></label></div>}

              {step === 3 && <fieldset className="type-options"><legend className="sr-only">{copy.homeTypes}</legend>{propertyTypes.map((type) => <label className={`large-option ${guideAnswers.propertyTypes.includes(type.value) ? "selected" : ""}`} key={type.value}><input type="checkbox" checked={guideAnswers.propertyTypes.includes(type.value)} onChange={() => setGuideAnswers((current) => ({ ...current, propertyTypes: toggleArray(current.propertyTypes, type.value) }))} /><span><strong>{type.label[language]}</strong><small>{type.description[language]}</small></span><Check size={19} /></label>)}</fieldset>}

              {step === 4 && <fieldset className="type-options"><legend className="sr-only">{copy.timing}</legend>{timingOptions.map((option) => <label className={`large-option ${guideAnswers.moveIn === option.value ? "selected" : ""}`} key={option.value}><input type="radio" name="timing" checked={guideAnswers.moveIn === option.value} onChange={() => setGuideAnswers((current) => ({ ...current, moveIn: option.value }))} /><span><strong>{option.label[language]}</strong><small>{option.body[language]}</small></span><Check size={19} /></label>)}</fieldset>}

              {step === 5 && <fieldset className="option-grid priorities"><legend><span className="field-heading"><span>{copy.familyPriorities}</span><HelpTip label={`${copy.familyPriorities}: help`}>{copy.prioritiesHelp}</HelpTip></span></legend>{priorities.map((priority) => <label className={`option-tile ${guideAnswers.priorities.includes(priority.value) ? "selected" : ""}`} key={priority.value}><input type="checkbox" checked={guideAnswers.priorities.includes(priority.value)} disabled={!guideAnswers.priorities.includes(priority.value) && guideAnswers.priorities.length >= 3} onChange={() => setGuideAnswers((current) => ({ ...current, priorities: toggleArray(current.priorities, priority.value) }))} /><span>{priority.label[language]}</span>{guideAnswers.priorities.includes(priority.value) && <Check size={18} />}</label>)}</fieldset>}

              <div className="question-actions"><button type="button" className="button secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={18} />{copy.back}</button><button type="button" className="button primary" onClick={advance} disabled={(step === 1 && !guideAnswers.areas.length) || (step === 3 && !guideAnswers.propertyTypes.length)}>{step === 5 ? copy.results : copy.next}<ArrowRight size={18} /></button></div>
            </section>

            {impacts.length > 0 && <section className="choice-history" aria-label={copy.choices}><div className="choice-history-heading"><strong>{copy.choices}</strong><button type="button" className="reset-link" onClick={restart}><RotateCcw size={15} />{copy.restart}</button></div><div className="impact-list">{impacts.map((impact, index) => <button key={impact.id} type="button" aria-label={`${copy.remove}: ${copy.impactLabels[index]}`} onClick={() => { setCompletedSteps(index); setStep(index); }}><Check size={15} /><span>{copy.impactLabels[index]}<small>{impact.rankingOnly ? copy.rankingOnly : `${impact.before} → ${impact.after}`}</small></span><X size={14} /></button>)}</div></section>}
          </div>
        </div>
      ) : (
        <section className="guide-results">
          <div className="results-kubo"><Image src="/images/kubo-guide-celebrate.webp" alt="Kubo celebrating the finished guide" width={720} height={720} unoptimized /><div className="kubo-speech"><span>Kubo</span><p>{copy.celebration}</p></div></div>
          <div className="results-content">
            <div className="results-heading"><div><span className="eyebrow">{filtered.length} {copy.retained}</span><h2>{filtered.length ? copy.matchesTitle : copy.zeroTitle}</h2><p>{filtered.length ? `${copy.matchesBody} ${peso(maxAffordablePrice(guideAnswers))}.` : copy.zeroBody}</p></div><button type="button" className="button secondary" onClick={restart}><RotateCcw size={16} />{copy.restart}</button></div>
            {filtered.length ? <div className="property-grid">{matches.slice(0, 6).map(({ listing, score }, index) => <PropertyCard key={listing.id} listing={listing} score={score.total} priority={index === 0} />)}</div> : <div className="relaxation-grid">{getRelaxationSuggestions(listings, guideAnswers).map((suggestion) => { const label = suggestion.id === "budget" ? copy.relaxBudget : suggestion.id === "bedrooms" ? copy.relaxBedrooms : copy.relaxAreas; return <button type="button" key={suggestion.id} onClick={() => { setGuideAnswers(suggestion.answers); setCompletedSteps(6); }}><strong>{suggestion.count} {copy.homesWord}</strong><span>{label}</span><small>{copy.apply}</small></button>; })}</div>}
            <div className="score-explainer"><Info /><div><strong>{copy.scoreTitle}</strong><p>{copy.scoreBody}</p></div></div>
          </div>
        </section>
      )}
    </div>
  );
}
