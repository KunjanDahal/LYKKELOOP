const steps = [
  {
    number: "1",
    title: "Browse styles",
    description: "Explore our curated collection of affordable earrings",
    icon: "🔍",
  },
  {
    number: "2",
    title: "Order in a few clicks",
    description: "Simple checkout process, secure payment",
    icon: "🛒",
  },
  {
    number: "3",
    title: "Delivered to your door",
    description: "Fast shipping across Denmark",
    icon: "📦",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-brown text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center space-y-4"
            >
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-rose/20 rounded-full flex items-center justify-center text-3xl mx-auto">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brown text-beige rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-brown">{step.title}</h3>
              <p className="text-brown/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



