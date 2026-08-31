"use client";

/**
 * Right-to-left scrolling offer banner for the "Buy More, Save More" tiers.
 * The track holds two identical copies of the deal list so the loop is
 * seamless — when the first copy scrolls fully off, the second is already in
 * its place. Pauses on hover.
 */

type Deal = {
  qty: number;
  price: string;
  save: string;
  emoji: string;
};

const DEALS: Deal[] = [
  { qty: 2, price: "₹649", save: "149", emoji: "🙂" },
  { qty: 3, price: "₹849", save: "348", emoji: "😀" },
  { qty: 4, price: "₹999", save: "597", emoji: "😃" },
  { qty: 5, price: "₹1,149", save: "846", emoji: "🤩" },
];

function DealItem({ d }: { d: Deal }) {
  const noSave = d.save === "0";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 11,
        padding: "0 32px",
        fontSize: 18,
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: "0.01em",
        color: "#4A3B2A",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 24 }}>
        {d.emoji}
      </span>
      <span>
        Buy {d.qty} at{" "}
        <strong style={{ color: "#26221C", fontWeight: 800 }}>{d.price}</strong>
      </span>
      {noSave ? (
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#A15E38",
          }}
        >
          Start here
        </span>
      ) : (
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#5E7C4E",
            background: "#EAF1E4",
            borderRadius: 999,
            padding: "5px 13px",
          }}
        >
          save ₹{d.save}
        </span>
      )}
      <span
        aria-hidden="true"
        style={{ color: "#D9B98E", padding: "0 4px", fontSize: 18 }}
      >
        •
      </span>
    </span>
  );
}

export default function OfferMarquee() {
  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...DEALS, ...DEALS];
  return (
    <div
      className="offer-marquee"
      role="marquee"
      aria-label="Buy more, save more pricing: Buy 2 at ₹649 save ₹149, Buy 3 at ₹849 save ₹348, Buy 4 at ₹999 save ₹597, Buy 5 at ₹1,149 save ₹846. Maximum 5 per product."
    >
      <div className="offer-marquee-track" aria-hidden="true">
        {loop.map((d, i) => (
          <DealItem key={i} d={d} />
        ))}
      </div>

      <style jsx>{`
        .offer-marquee {
          position: relative;
          overflow: hidden;
          margin: 40px auto 0;
          max-width: 1100px;
          padding: 22px 0;
          border-top: 1px solid #e7dac6;
          border-bottom: 1px solid #e7dac6;
          background: linear-gradient(
            90deg,
            #fbf4e9 0%,
            #f7ecda 50%,
            #fbf4e9 100%
          );
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 8%,
            #000 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            90deg,
            transparent 0,
            #000 8%,
            #000 92%,
            transparent 100%
          );
        }
        .offer-marquee-track {
          display: inline-flex;
          align-items: center;
          width: max-content;
          animation: offer-scroll 26s linear infinite;
          will-change: transform;
        }
        .offer-marquee:hover .offer-marquee-track {
          animation-play-state: paused;
        }
        @keyframes offer-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .offer-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
