import { getAllPosts, getPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
	return getAllPosts().map((p) => ({ slug: p.slug }));
}

/**
 * Raw-markdown variant of a blog post, exposed as /blog/<slug>.md via a
 * rewrite in next.config.mjs (llms.txt spec convention for LLM-friendly
 * page versions).
 */
export function GET(_req: Request, { params }: { params: { slug: string } }) {
	const post = getPost(params.slug);
	if (!post) {
		return new Response("Not found", { status: 404 });
	}

	const markdown = `# ${post.title}

By ${post.author}, Co-founder of SkinSnap · Published ${post.publishedAt}
Canonical: ${SITE_URL}/blog/${post.slug}

${post.content.replace(/^\s*<[A-Z][^>]*\/>\s*$/gm, "").trim()}
`;

	return new Response(markdown, {
		headers: { "content-type": "text/markdown; charset=utf-8" },
	});
}
