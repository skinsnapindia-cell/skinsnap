"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

/**
 * Fires a GA4 page_view on every route change (the gtag config in the root
 * layout sets send_page_view: false so views aren't double-counted).
 *
 * Pushes through the dataLayer queue rather than requiring window.gtag —
 * gtag.js loads afterInteractive, so on a hard load this effect usually runs
 * BEFORE the script arrives; queued entries are replayed once it does.
 */
export default function GoogleAnalytics({
	measurementId,
}: {
	measurementId: string;
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		window.dataLayer = window.dataLayer || [];
		const gtag = function () {
			// biome-ignore lint/complexity/noArguments: gtag.js requires the live Arguments object, not an array
			window.dataLayer?.push(arguments);
		} as (...args: unknown[]) => void;

		const search = searchParams.toString();
		const pagePath = search ? `${pathname}?${search}` : pathname;

		gtag("event", "page_view", {
			page_path: pagePath,
			send_to: measurementId,
		});
	}, [measurementId, pathname, searchParams]);

	return null;
}
