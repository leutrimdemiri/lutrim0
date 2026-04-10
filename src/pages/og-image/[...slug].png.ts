import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";

const ogOptions: SatoriOptions = {
	// debug: true,
	fonts: [
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(RobotoMonoBold),
			name: "Roboto Mono",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#b25d7a] text-xl">
			<div tw="flex items-center">
			<svg
				height="60"
				viewBox="0 0 600 400"
				xmlns="http://www.w3.org/2000/svg"
				xml:space="preserve"
				style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
			>
				<path
					d="M561.38 68.121V331.88c0 31.844-25.853 57.697-57.697 57.697H96.317c-31.844 0-57.697-25.853-57.697-57.697V68.121c0-31.844 25.853-57.697 57.697-57.697h407.366c31.844 0 57.697 25.853 57.697 57.697"
					style="fill:#b25d7a"></path>
				<path
					style="fill:#fff;fill-rule:nonzero;stroke:#000;stroke-opacity:0;stroke-width:1px"
					d="M95.792 63.173h36.347v258.013H95.792zM201.97 313.487q15.219 7.7 34.02 7.699 18.8 0 34.02-7.699a29.7 29.7 0 0 0 4.834-3.044v10.564h36.347V145.358h-36.526v89.167q0 21.308-7.52 34.02-9.669 16.293-31.155 16.294-21.844 0-31.513-16.831-7.341-12.891-7.341-34.736v-87.914h-36.347v87.914q0 28.649 10.922 49.776 10.743 20.59 30.26 30.439Zm176.186-98.836q7.699-32.945 43.868-32.945 36.168 0 43.868 32.945zm126.052 34.378v-17.368q0-8.774-1.432-17.01-5.013-32.23-26.5-50.671-21.486-18.621-54.252-18.621-37.422 0-59.803 23.993-22.381 23.814-22.381 63.921t22.919 63.921q22.74 23.993 61.056 23.993 26.5 0 47.09-11.459 20.59-11.28 30.439-31.513l-32.587-15.936q-5.193 10.564-17.01 16.652-11.997 5.909-27.932 5.909-39.212 0-46.195-35.81h126.589Z"
				></path>
			</svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate), ogOptions);
	const pngBuffer = new Resvg(svg).render().asPng();
	const png = new Uint8Array(pngBuffer);
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
