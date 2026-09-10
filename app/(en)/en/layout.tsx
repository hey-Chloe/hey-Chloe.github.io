import { SiteDocument,siteMetadata } from "@/components/site-document";
export const metadata=siteMetadata("en");
export default function Layout({children}:{children:React.ReactNode}){return <SiteDocument locale="en">{children}</SiteDocument>;}
