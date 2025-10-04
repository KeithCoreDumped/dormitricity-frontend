import createMDX from "@next/mdx";
// import remarkGfm from 'remark-gfm'

const withMDX = createMDX({
    extension: /\.mdx?$/,
    //     options: {
    //     remarkPlugins: [remarkGfm],
    //     rehypePlugins: [],
    //   },
});

const nextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    i18n: {
        locales: ["en", "zh", "ja"],
        defaultLocale: "en",
    },
};

export default {
    ...withMDX(nextConfig),
    async rewrites() {
        return [
            {
                source: "/xapi/:path*",
                destination:
                    `${process.env.WORKERS_BASE}/:path*`,
                basePath: false,
            },
        ];
    },
};
