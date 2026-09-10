"use client";
import { useState } from "react";
import { labels,type Locale } from "@/lib/localization";
export function CopyButton({text,locale="zh"}:{text:string;locale?:Locale}) {
 const l=labels(locale);const [status,setStatus]=useState<"copy"|"copied"|"copyFallback">("copy");
 return <button type="button" className="copy-button" onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus("copied");}catch{setStatus("copyFallback");}}}><span aria-live="polite">{l[status]}</span></button>;
}
