import { research } from "@/data";
import { ResearchDetail,researchMetadata } from "@/components/research-detail";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return research.length?research.map(({slug})=>({slug})):[{slug:"_unpublished"}];}
export async function generateMetadata({params}:Props){return researchMetadata((await params).slug,"en");}
export default async function Page({params}:Props){return <ResearchDetail slug={(await params).slug} locale="en"/>;}
