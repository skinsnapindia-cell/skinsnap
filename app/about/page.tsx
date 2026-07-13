import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import ProductCta from "@/components/ProductCta";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"SkinSnap is a three-founder Indian skincare brand making single-use dual-chamber face packs — rose water and herbal powder sealed separately, mixed fresh when you press.",
	alternates: { canonical: "/about" },
	openGraph: {
		url: "/about",
		title: "About SkinSnap",
		description:
			"The three-founder Indian brand behind the dual-chamber fresh-activation face pack.",
	},
};

const founders = ["Sagar", "Pratham", "Tarun"];

const facts = [
	{
		q: "What is SkinSnap?",
		a: "A single-use face pack pouch with two sealed chambers: 20ml of pure rose water on one side and 20g of herbal powder on the other. They stay separate until you press the rose water chamber, massage for 10–15 seconds to mix, tear the corner and apply.",
	},
	{
		q: "Why dual chambers?",
		a: "Bulk clay powder absorbs moisture and hardens in Indian humidity, and pre-mixed cream packs need preservatives to survive months in a tube. Keeping the liquid and powder sealed apart means every pack activates fresh — with no preservatives and no chemicals at all.",
	},
	{
		q: "What does it cost?",
		a: "A single pouch is ₹29. The 4-in-1 combo with all four variants — Multani Mitti, Orange Peel, De-Tan and Korean Glow — is ₹99.",
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
					sealed until you need it.
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
						SkinSnap started with a familiar frustration. Traditional face packs
						come in two flavours of compromise: loose powders that clump and
						harden in humid Indian bathrooms, or pre-mixed creams that sit in
						tubes for months and need preservatives to stay usable. Fresh was
						clearly better — but fresh meant bowls, spoons, guessed ratios and a
						stained washbasin every single time.
					</p>
					<p style={{ margin: "0 0 18px" }}>
						So we built the dual-chamber pouch. One chamber holds 20ml of pure
						rose water, the other 20g of herbal powder, sealed apart from the
						day it is packed. Press the rose water chamber, massage for a few
						seconds, tear and apply — a freshly activated face pack with the
						exact right ratio, no mess and no preservatives.
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
