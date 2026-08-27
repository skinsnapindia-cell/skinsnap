import { type BlogPost, getAllPosts } from "@/lib/blog";
import { productDisplayName, products } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

/**
 * Shared builders for the /llms.txt and /llms-full.txt AEO endpoints
 * (spec: https://llmstxt.org/). Everything is derived from lib/products.ts
 * and content/blog so the files never drift from the site.
 */

const HEADER = `# SkinSnap

> SkinSnap is an Indian D2C skincare brand selling 100% natural face-pack powders in 50g jars. Each jar is pure, finely milled clay and botanicals with no preservatives and no chemicals: scoop a spoonful, mix with a little water or rose water into a smooth paste, and apply — a freshly mixed face pack every time. Single jars use "Buy More, Save More" quantity pricing per product: 1 jar ₹399, 2 for ₹649, 3 for ₹849, 4 for ₹999, 5 for ₹1,149; quantities above 5 use the 5-pack per-unit price (₹229.80/jar). The 4-in-1 combo box (all four 50g jars) is a fixed ₹749. Website: ${SITE_URL}

SkinSnap was founded by a three-person team — Sagar, Pratham and Tarun — to make honest, natural skincare simple: pure powders you mix fresh at home, so there are no preservatives and nothing sitting pre-mixed in a tube. Variants: Multani Mitti (oil control), Orange Peel (vitamin-C brightening), De-Tan (turmeric + clay), Korean Glow (healthy glow). Instagram: @skinsnap.india.

Markdown versions of blog guides are available by appending .md to any guide URL.`;

/** strip MDX component tags (e.g. <ProductCta .../>) — everything else is plain markdown */
function mdxToMarkdown(content: string) {
	return content.replace(/^\s*<[A-Z][^>]*\/>\s*$/gm, "").trim();
}

function productLines() {
	return products
		.map(
			(p) =>
				`- [${productDisplayName(p)}](${SITE_URL}/product/${p.slug}): ${p.desc} Price: ${p.price}.`,
		)
		.join("\n");
}

function guideLines(posts: BlogPost[]) {
	return posts
		.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`)
		.join("\n");
}

export function buildLlmsTxt() {
	const posts = getAllPosts();
	return `${HEADER}

## Products

${productLines()}

## Guides

${guideLines(posts)}

## Company

- [About SkinSnap](${SITE_URL}/about): Who we are and why we make pure, mix-fresh powders.
- [How It Works](${SITE_URL}/how-it-works): The scoop → mix → apply → glow routine.
- [Contact](${SITE_URL}/contact): Email, Instagram and WhatsApp support.

## Optional

- [All Products](${SITE_URL}/products): Product listing page.
- [Blog Index](${SITE_URL}/blog): All skincare guides.
`;
}

export function buildLlmsFullTxt() {
	const posts = getAllPosts();

	const productSections = products
		.map((p) => {
			const ingredients = p.ingredients
				.map((i) => `- ${i.name}: ${i.body}`)
				.join("\n");
			return `### ${productDisplayName(p)}

URL: ${SITE_URL}/product/${p.slug}
Price: ${p.price} (MRP ₹${p.mrpNum})

${p.long}

What's inside:
${ingredients}`;
		})
		.join("\n\n");

	const articleSections = posts
		.map(
			(p) => `## ${p.title}

URL: ${SITE_URL}/blog/${p.slug}
Author: ${p.author}, Co-founder of SkinSnap · Published ${p.publishedAt}

${mdxToMarkdown(p.content)}`,
		)
		.join("\n\n---\n\n");

	return `${HEADER}

## Products

${productSections}

---

${articleSections}
`;
}
