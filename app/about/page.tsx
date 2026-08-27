import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProductCta from "@/components/ProductCta";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"SkinSnap is a three-founder Indian skincare brand making 100% natural face-pack powders — 50g jars of pure clay and botanicals you mix fresh at home with water or rose water.",
	alternates: { canonical: "/about" },
	openGraph: {
		url: "/about",
		title: "About SkinSnap",
		description:
			"The three-founder Indian brand behind the pure, mix-fresh natural face-pack powder.",
	},
};

const founders = ["Sagar", "Pratham", "Tarun"];

const facts = [
	{
		q: "What is SkinSnap?",
		a: "A 50g jar of 100% natural face-pack powder — pure, finely milled clay and botanicals with nothing added. You scoop a spoonful, mix it with a little water or rose water into a smooth paste, apply, and rinse after 10–15 minutes.",
	},
	{
		q: "Why a powder?",
		a: "Pre-mixed cream packs sit in a tube for months and need preservatives to survive, while a powder you mix yourself needs none. Keeping it dry until the moment of use means every pack is fresh and full-strength — with no preservatives and no chemicals at all.",
	},
	{
		q: "What does it cost?",
		a: "A single 50g jar is ₹399, and the more you buy the less each costs — 2 for ₹649, 3 for ₹849, 4 for ₹999, and 5 for ₹1,149 (about ₹230 a jar). The 4-in-1 combo box with all four variants is ₹749.",
	},
	{
		q: "Where is SkinSnap from?",
		a: "SkinSnap is an Indian brand, built for Indian skin, climate and budgets. We sell across India and talk to customers on Instagram (@skinsnap.india) and WhatsApp.",
	},
];

export default function AboutPage() {
	return (
		<div className="wrap">
			<Nav active="home" />

			{/* HEADER */}
			<section
				className="section-pad"
				style={{
					padding: "180px 48px 60px",
					textAlign: "center",
					background:
						"radial-gradient(120% 100% at 50% 0%, #FBF6EF 0%, #EFE4D4 100%)",
				}}
			>
				<div
					style={{
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.3em",
						textTransform: "uppercase",
						color: "#A15E38",
					}}
				>
					About Us
				</div>
				<h1
					className="section-title h-xl"
					style={{ fontSize: 60, lineHeight: 1.05, margin: "20px 0 0" }}
				>
					Fresh skincare,
					<br />
					mixed when you need it.
				</h1>
			</section>

			{/* STORY */}
			<section
				className="section-pad"
				style={{ padding: "50px 48px 40px", background: "#F6F1E9" }}
			>
				<div
					style={{
						maxWidth: 720,
						margin: "0 auto",
						fontSize: 16,
						lineHeight: 1.75,
						color: "#4A443B",
					}}
				>
					<p style={{ margin: "0 0 18px" }}>
						SkinSnap started with a familiar frustration. Pre-mixed cream packs
						sit in tubes for months and need preservatives to stay usable, and
						most powders on the shelf are padded out with fillers and fragrance.
						Fresh, pure clay was clearly better — mixed only when you need it,
						with nothing added to make it last.
					</p>
					<p style={{ margin: "0 0 18px" }}>
						So we kept it simple: a 50g jar of pure, natural powder and nothing
						else. Scoop a spoonful, add a little water or rose water, stir into a
						smooth paste and apply — a freshly mixed face pack every time, with
						no preservatives and no chemicals.
					</p>
					<p style={{ margin: "0 0 18px" }}>
						We are a three-person founding team — {founders.join(", ")} — and we
						are still a small company that makes one thing and tries to make it
						well. Everything we have learned about clay, rose water and honest
						skincare routines is written up in our{" "}
						<Link href="/blog" style={{ color: "#A15E38" }}>
							guides
						</Link>
						.
					</p>
				</div>
			</section>

			{/* QUICK FACTS */}
			<section
				className="section-pad"
				style={{ padding: "20px 48px 60px", background: "#F6F1E9" }}
			>
				<div style={{ maxWidth: 720, margin: "0 auto" }}>
					<h2
						className="section-title"
						style={{ fontSize: 34, margin: "0 0 22px" }}
					>
						SkinSnap in four answers
					</h2>
					{facts.map((f) => (
						<div
							key={f.q}
							style={{
								background: "#FCFAF5",
								border: "1px solid #EAE0D0",
								borderRadius: 16,
								padding: "20px 24px",
								marginBottom: 14,
							}}
						>
							<div style={{ fontWeight: 700, fontSize: 16, color: "#26221C" }}>
								{f.q}
							</div>
							<p
								style={{
									fontSize: 15,
									color: "#4A443B",
									lineHeight: 1.7,
									margin: "10px 0 0",
								}}
							>
								{f.a}
							</p>
						</div>
					))}

					<h2
						className="section-title"
						style={{ fontSize: 34, margin: "40px 0 8px" }}
					>
						Start with the combo
					</h2>
					<ProductCta slug="combo-pack" />
				</div>
			</section>

			<Footer />
		</div>
	);
}
