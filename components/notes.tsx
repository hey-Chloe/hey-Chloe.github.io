import Link from "next/link";
import { getNotes } from "@/lib/writing";
import { EmptyState } from "@/components/ui";
import { Arrow } from "@/components/icons";
import { localizedContent } from "@/components/localized-content";
import { labels,localePath,type Locale } from "@/lib/localization";
export async function NotesList({limit,locale="zh",tag}:{limit?:number;locale?:Locale;tag?:string}) {
 const publishedNotes=await getNotes();const notes=tag?publishedNotes.filter(note=>note.tags.includes(tag)):publishedNotes;const {siteCopy}=localizedContent(locale);const l=labels(locale);
 if(!notes.length)return <EmptyState locale={locale} title={siteCopy.writing.emptyTitle} description={siteCopy.writing.emptyDescription}/>;
 return <div className="notes-list">{notes.slice(0,limit).map(note=><article key={note.slug} className="note-row"><time dateTime={note.date}>{note.date}</time><div><h3><Link href={localePath(`/writing/${note.slug}/`,locale)}>{note.title}</Link></h3><p>{note.description}</p><span className="small-label">{note.tags.join(" · ")} · {note.readingTime} {l.minRead}</span></div><Arrow diagonal/></article>)}</div>;
}
