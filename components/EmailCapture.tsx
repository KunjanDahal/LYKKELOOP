"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    alert(`Thanks for joining! Check your email: ${email}`);
    setEmail("");
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-lg border border-brown/10">
        <h2 className="text-3xl md:text-4xl font-bold text-brown mb-4">
          Get 10% Off Your First Order
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mt-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-6 py-3 border-2 border-brown/20 rounded-full focus:outline-none focus:border-rose text-brown placeholder-brown/50"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium whitespace-nowrap"
          >
            Join the LykkeLoop
          </button>
        </form>
        <p className="text-sm text-brown/70 mt-4">
          No spam, only pretty things.
        </p>
      </div>
    </section>
  );
}



