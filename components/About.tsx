export default function About() {
  return (
    <section id="about" className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-brown mb-6">
          About LykkeLoop
        </h2>
        <p className="text-lg text-brown/80 leading-relaxed">
          LykkeLoop was born from a simple idea: everyone deserves to feel beautiful 
          without breaking the bank. We curate affordable, trendy earrings and 
          accessories designed for everyday wear, bringing a touch of hygge to your 
          daily style.
        </p>
        <p className="text-lg text-brown/80 leading-relaxed">
          Based in Denmark, we understand the Danish love for minimal, quality design. 
          Our pieces are nickel-safe, skin-friendly, and perfect for those who want 
          to express their style without compromise.
        </p>
        <div className="pt-8">
          <div className="inline-block px-6 py-3 bg-rose/20 text-brown rounded-full font-medium">
            ✨ Quality earrings under 149 DKK
          </div>
        </div>
      </div>
    </section>
  );
}



