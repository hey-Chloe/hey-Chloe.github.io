import { createHeadingId } from '@/lib/mdx'

export const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(props.children ?? '')
    return <h2 id={createHeadingId(text)} {...props} />
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(props.children ?? '')
    return <h3 id={createHeadingId(text)} {...props} />
  },
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 rounded-2xl border border-sakura-200 bg-sakura-50/80 p-5 text-sakura-700 shadow-soft">
      {children}
    </div>
  )
}
