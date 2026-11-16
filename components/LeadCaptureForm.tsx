import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Download, Loader2, ShieldCheck } from 'lucide-react';
import { guideDeliveryNotice, parseMarketingSignupUrl } from '../lib/lead-delivery';
import { GUIDE_PDF, saveLeadRequest, type GuideSubscriber, type LeadIntent, type LeadSaveResult } from '../lib/guide-access';

export interface LeadCaptureFormProps {
  onSuccess: (subscriber: GuideSubscriber) => void;
  intent?: LeadIntent;
}

export function LeadCaptureForm({ onSuccess, intent = 'guide' }: LeadCaptureFormProps) {
  const id = useId();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [bundleConsent, setBundleConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [bundleAvailable, setBundleAvailable] = useState(false);
  const [guideEmailAvailable, setGuideEmailAvailable] = useState(false);
  const [marketingSignupUrl, setMarketingSignupUrl] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ intent: LeadIntent; result: LeadSaveResult } | null>(null);
  const submitting = useRef(false);
  const generation = useRef(0);
  const submission = useRef<AbortController | null>(null);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const current = ++generation.current;
    submission.current?.abort();
    submitting.current = false;
    setLoading(false); setSaved(null); setError(null); setBundleConsent(false); setWebsite('');
    setBundleAvailable(false);
    setGuideEmailAvailable(false); setMarketingSignupUrl(null);
    setConfigLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      if (generation.current === current) setConfigLoading(false);
    }, 5000);
    fetch(intent === 'guide' ? '/api/subscribe' : '/api/bundle-interest', { signal: controller.signal })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (generation.current !== current || controller.signal.aborted || !data) return;
          if (intent === 'bundle') { setBundleAvailable(data.available === true); return; }
          setGuideEmailAvailable(data.guideEmailAvailable === true);
          setMarketingSignupUrl(parseMarketingSignupUrl(data.marketingSignupUrl));
        })
        .catch(() => { /* Guide requests can still be saved; bundle alerts fail closed. */ })
        .finally(() => { clearTimeout(timeout); if (generation.current === current) setConfigLoading(false); });
    return () => {
      ++generation.current;
      controller.abort(); clearTimeout(timeout);
      submission.current?.abort(); submission.current = null;
      if (submitTimer.current) clearTimeout(submitTimer.current);
      submitting.current = false;
    };
  }, [intent]);

  useEffect(() => { if (saved?.intent === intent) successHeading.current?.focus({ preventScroll: true }); }, [saved, intent]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || configLoading || (intent === 'bundle' && !bundleAvailable)) return;
    submitting.current = true; setLoading(true); setError(null);
    const current = generation.current;
    const controller = new AbortController();
    submission.current = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    submitTimer.current = timeout;
    try {
      const result = await saveLeadRequest({ name: firstName, email, intent, emailGuideAvailable: guideEmailAvailable, bundleConsent, website, signal: controller.signal });
      if (generation.current !== current || controller.signal.aborted) return;
      setSaved({ intent, result });
    } catch (failure) {
      if (generation.current !== current) return;
      setError(controller.signal.aborted
        ? intent === 'guide'
          ? 'The connection timed out. Please try again; repeating a guide request will not restart email delivery.'
          : 'The connection timed out. Please try saving your bundle interest again.'
        : failure instanceof Error ? failure.message : 'We could not save your request. Please try again.');
    } finally {
      clearTimeout(timeout);
      if (generation.current === current) { submitting.current = false; submission.current = null; submitTimer.current = null; setLoading(false); }
    }
  }

  const completed = saved?.intent === intent ? saved.result : null;
  if (completed) return (
    <div className="space-y-4" role="status" aria-live="polite">
      <h3 ref={successHeading} tabIndex={-1} className="font-serif text-2xl font-bold text-[#14382B] focus:outline-none">
        {intent === 'bundle' ? 'Your bundle request was received.' : `Your guide is ready, ${completed.subscriber.name}.`}
      </h3>
      <p className="text-sm leading-relaxed text-[#4A463F]">{intent === 'bundle'
        ? 'The $39 bundle is not for sale yet. This records launch-alert interest only. No email has been sent and no purchase was made. Repeating this request does not renew a permission you previously withdrew. You have not joined the seven-email series. Launch-alert automation is not active yet.'
        : guideDeliveryNotice(completed.emailDeliveryStatus)}</p>
      {intent === 'guide' && <>
        <a href={GUIDE_PDF} download="The-7-Day-Gentle-Gut-Reset-Guide.pdf" className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#B85D36] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#9B4E2D]"><Download className="h-4 w-4" aria-hidden="true" />Download free PDF</a>
        <button type="button" onClick={() => onSuccess(completed.subscriber)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#14382B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0E281E]"><BookOpen className="h-4 w-4" aria-hidden="true" />Open guide reader</button>
        {marketingSignupUrl && <div className="space-y-2 border-t border-[#E5DFD5] pt-4 text-sm leading-relaxed text-[#4A463F]">
          <a href={marketingSignupUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#14382B] underline underline-offset-4">Join the optional seven-email series</a>
          <p className="text-xs">Practical notes over about 16 days, including occasional paid PDF offers. Separate signup and email confirmation required. Your guide access does not depend on joining.</p>
        </div>}
      </>}
    </div>
  );

  if (intent === 'bundle' && (configLoading || !bundleAvailable)) return <div className="space-y-3 text-sm leading-relaxed text-[#4A463F]" role="status" aria-live="polite">
    {configLoading ? <p>Checking bundle launch-alert availability…</p> : <>
      <p>Bundle launch alerts are not open yet.</p>
      <p>Contact <a className="font-semibold text-[#14382B] underline underline-offset-4" href="mailto:hello@everydaygutwellness.com">hello@everydaygutwellness.com</a> with questions about the planned $39 bundle.</p>
      <p className="text-xs">No signup was saved and no email was requested.</p>
    </>}
  </div>;

  return <form onSubmit={submit} className="space-y-4" aria-busy={loading} aria-describedby={`${id}-privacy`}>
    <div>
      <label htmlFor={`${id}-name`} className="mb-1 block text-sm font-semibold text-[#14382B]">First name <span aria-hidden="true">*</span></label>
      <input id={`${id}-name`} name="firstName" type="text" autoComplete="given-name" required maxLength={80} value={firstName} onChange={event => setFirstName(event.target.value)} disabled={loading} className="min-h-11 w-full rounded-lg border border-[#D5CFC5] bg-white px-3 py-3 text-base text-[#14382B] focus:outline focus:outline-2 focus:outline-[#14382B]" />
    </div>
    <div>
      <label htmlFor={`${id}-email`} className="mb-1 block text-sm font-semibold text-[#14382B]">Email address <span aria-hidden="true">*</span></label>
      <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={loading} className="min-h-11 w-full rounded-lg border border-[#D5CFC5] bg-white px-3 py-3 text-base text-[#14382B] focus:outline focus:outline-2 focus:outline-[#14382B]" />
    </div>
    {intent === 'bundle' && <label htmlFor={`${id}-bundle`} className="flex items-start gap-3 text-sm leading-relaxed text-[#4A463F]">
      <input id={`${id}-bundle`} name="launchConsent" type="checkbox" required checked={bundleConsent} onChange={event => setBundleConsent(event.target.checked)} disabled={loading} className="mt-1 h-5 w-5 shrink-0 accent-[#14382B]" />
      <span>Email me when the $39 bundle is available. This is separate from the optional seven-email series.</span>
    </label>}
    {intent === 'bundle' && <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
    </div>}
    <p id={`${id}-privacy`} className="text-xs leading-relaxed text-[#635F57]">{intent === 'bundle'
      ? 'Your name, email and bundle-specific permission will be saved separately from guide requests. The bundle is not available for purchase yet. You can withdraw this permission by contacting us.'
      : guideEmailAvailable
        ? 'This requests a free guide email copy and unlocks the reader and PDF after your details are saved. It does not sign you up for marketing.'
        : 'Your name and email are required to unlock the free reader and PDF. Email-copy delivery may be unavailable; save the PDF after confirmation. This does not sign you up for marketing.'} <a href="/privacy" className="underline underline-offset-2">Privacy policy</a></p>
    {error && <p id={`${id}-error`} role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <button type="submit" disabled={loading || configLoading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#14382B] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0E281E] disabled:opacity-60">
      {loading || configLoading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{configLoading ? 'Preparing your request…' : 'Saving your request…'}</> : <>{intent === 'bundle' ? 'Get Bundle Launch Alert' : 'Get the Free Guide'}<ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
    </button>
    <p className="flex items-start gap-2 text-xs leading-relaxed text-[#635F57]"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />No payment details required. Please do not submit personal health information.</p>
  </form>;
}
