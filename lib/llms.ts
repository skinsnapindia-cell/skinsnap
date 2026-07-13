import { type BlogPost, getAllPosts } from "@/lib/blog";
import { productDisplayName, products } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

/**
 * Shared builders for the /llms.txt and /llms-full.txt AEO endpoints
 * (spec: https://llmstxt.org/). Everything is derived from lib/products.ts
 * and content/blog so the files never drift from the site.
 */

const HEADER = `# SkinSnap

> SkinSnap is an Indian D2C skincare brand selling single-use, dual-chamber natural face pack pouches. Each pouch keeps 20ml of pure rose water and 20g of herbal powder sealed separately until use: press the rose water chamber, massage 10–15 seconds to mix, tear the corner and apply — a freshly activated face pack with no bowl, no spoon and no preservatives. Singles cost ₹29, the 4-in-1 combo ₹99. Website: ${SITE_URL}

SkinSnap was founded by a three-person team — Sagar, Pratham and Tarun — to solve a specific problem: bulk clay powders harden and degrade with moisture, while pre-mixed cream packs need preservatives to survive the shelf. The dual-chamber pouch keeps ingredients fresh without either compromise. Variants: Multani Mitti (oil control), Orange Peel (vitamin-C brightening), De-Tan (turmeric + clay), Korean Glow (healthy glow). Instagram: @skinsnap.india.

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

- [About SkinSnap](${SITE_URL}/about): Who we are and why the dual-chamber pouch exists.
- [How It Works](${SITE_URL}/how-it-works): The press → mix → tear → apply activation flow.
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
