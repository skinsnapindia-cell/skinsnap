import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Skincare Guides & Face Pack Tips",
  description:
    "Honest guides on multani mitti, tan removal, orange peel, rose water and natural face packs — how to use them, how often, and what actually works.",
  alternates: { canonical: "/blog" },
  openGraph: {
    url: "/blog",
    title: "SkinSnap Skincare Guides",
    description:
      "Honest guides on multani mitti, tan removal and natural face packs.",
  },
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="wrap">
      <Nav active="blog" />

      {/* HEADER */}
      <section
        className="section-pad"
        style={{
          padding: "180px 48px 70px",
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
          The SkinSnap Blog
        </div>
        <h1
          className="section-title h-xl"
          style={{ fontSize: 64, lineHeight: 1.05, margin: "20px 0 0" }}
        >
          Skincare guides,
          <br />
          minus the myths.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#5A5348",
            maxWidth: 560,
            margin: "24px auto 0",
            lineHeight: 1.6,
          }}
        >
          Practical, honest answers about clay packs, tan removal and natural
          skincare — from the people who obsess over fresh activation.
        </p>
      </section>

      {/* POSTS */}
      <section
        className="section-pad"
        style={{ padding: "40px 48px 130px", background: "#F6F1E9" }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card"
              style={{
                display: "block",
                background: "#FCFAF5",
                border: "1px solid #EAE0D0",
                borderRadius: 22,
                padding: "30px 34px",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: 13, color: "#9B8F7C" }}>
                {dateFmt.format(new Date(post.publishedAt))} · {post.author}, Co-founder
              </div>
              <h2
                className="section-title"
                style={{
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#26221C",
                  margin: "10px 0 10px",
                }}
              >
                {post.title}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "#6B6357",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {post.description}
              </p>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#A15E38",
                }}
              >
                Read guide →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
