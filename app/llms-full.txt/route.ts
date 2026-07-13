import { buildLlmsFullTxt } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
	return new Response(buildLlmsFullTxt(), {
		headers: { "content-type": "text/markdown; charset=utf-8" },
	});
}
