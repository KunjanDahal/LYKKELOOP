const highlights = [
  { icon: "💰", text: "Under 149 DKK" },
  { icon: "🚚", text: "Free shipping over 399 DKK" },
  { icon: "✨", text: "Nickel-safe & skin-friendly" },
  { icon: "↩️", text: "Easy 30-day returns" },
];

export default function HighlightStrip() {
  return (
    <section className="bg-white/50 py-8 border-y border-brown/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="text-3xl">{highlight.icon}</div>
              <p className="text-sm font-medium text-brown">{highlight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



