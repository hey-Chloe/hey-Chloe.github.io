import { getNotes } from "@/lib/writing";
import { NoteContent,noteMetadata } from "@/components/note-page";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export async function generateStaticParams(){const notes=await getNotes();return notes.length?notes.map(({slug})=>({slug})):[{slug:"_unpublished"}];}
export async function generateMetadata({params}:Props){return noteMetadata((await params).slug,"zh");}
export default async function Page({params}:Props){return <NoteContent slug={(await params).slug} locale="zh"/>;}
