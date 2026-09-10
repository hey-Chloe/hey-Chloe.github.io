import { SiteDocument } from "@/components/site-document";
import { NotFoundContent } from "@/components/not-found";
export const metadata={title:"页面未找到 | 李晨悦",description:"该地址没有已发布的内容。",robots:{index:false,follow:false}};
export default function GlobalNotFound(){return <SiteDocument locale="zh"><NotFoundContent locale="zh"/></SiteDocument>;}
