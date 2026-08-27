// Allow side-effect imports of plain CSS (e.g. `import "./globals.css"`).
// Next.js only ships declarations for *.module.css, so newer TypeScript
// versions flag plain CSS imports in the editor (ts2882) without this.
declare module "*.css";

// Razorpay Checkout SDK, loaded on demand from checkout.razorpay.com.
interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: unknown) => void): void;
}
interface Window {
  Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
}
