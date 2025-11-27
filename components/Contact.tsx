export default function Contact() {
  return (
    <section id="contact" className="bg-white/50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-brown mb-6">
            Get in Touch
          </h2>
          <p className="text-lg text-brown/80">
            Have a question or need help? We&apos;d love to hear from you!
          </p>
          <div className="pt-8 space-y-4">
            <div>
              <p className="font-semibold text-brown mb-2">Email</p>
              <a
                href="mailto:hello@lykkeloop.dk"
                className="text-rose hover:underline"
              >
                hello@lykkeloop.dk
              </a>
            </div>
            <div>
              <p className="font-semibold text-brown mb-2">Location</p>
              <p className="text-brown/80">Copenhagen, Denmark</p>
            </div>
            <div>
              <p className="font-semibold text-brown mb-2">Response Time</p>
              <p className="text-brown/80">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



