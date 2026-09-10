import { SiteDocument,siteMetadata } from "@/components/site-document";
export const metadata=siteMetadata("zh");
export default function Layout({children}:{children:React.ReactNode}){return <SiteDocument locale="zh">{children}</SiteDocument>;}
