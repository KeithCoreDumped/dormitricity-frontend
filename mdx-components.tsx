import type { MDXComponents } from 'mdx/types'

// ref: https://note.bingkele.cc/nextjs-cn/app/guides/mdx#using-custom-styles-and-components

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
