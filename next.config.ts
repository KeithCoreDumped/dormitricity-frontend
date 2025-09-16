import createMDX from "@next/mdx";
// import remarkGfm from 'remark-gfm'

const withMDX = createMDX({ 
    extension: /\.mdx?$/,
//     options: {
//     remarkPlugins: [remarkGfm],
//     rehypePlugins: [],
//   },
});

const nextConfig = { pageExtensions: ["ts", "tsx", "mdx"] };

export default withMDX(nextConfig);