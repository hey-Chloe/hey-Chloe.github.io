export type ContactIconName = "cv" | "github" | "scholar" | "email";
export function ContactIcon({ name }: { name: ContactIconName }) {
  const paths = {
    cv: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></>,
    github: <><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.8a3.3 3.3 0 0 0-.9-2.5c3-.3 6.2-1.5 6.2-6.8a5.3 5.3 0 0 0-1.5-3.7 4.9 4.9 0 0 0-.1-3.7s-1.2-.4-3.8 1.4a13.1 13.1 0 0 0-6.9 0C5.4 1.1 4.2 1.5 4.2 1.5a4.9 4.9 0 0 0-.1 3.7A5.3 5.3 0 0 0 2.6 9c0 5.3 3.2 6.5 6.2 6.8a3.3 3.3 0 0 0-.8 2.5V22"/></>,
    scholar: <><path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v6c3.5 2.7 8.5 2.7 12 0v-6M22 9v7"/></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  };
  return <svg className="contact-icon" aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
export function Arrow({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return <svg aria-hidden="true" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}</svg>;
}
