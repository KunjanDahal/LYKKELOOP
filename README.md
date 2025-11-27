# LykkeLoop - Budget-Friendly Earrings & Accessories

A responsive landing page for LykkeLoop, a budget-friendly online earrings and accessories shop targeted at Danish customers. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 Scandinavian minimal design with warm color palette
- 📱 Fully responsive (mobile-first approach)
- 🎭 Smooth animations and hover effects
- 🔐 Login/Signup pages with form validation
- 🛍️ Product showcase with login-required modal
- ✨ Modern UI components with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with font configuration
│   ├── page.tsx            # Home page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── globals.css         # Global styles and animations
├── components/
│   ├── Navbar.tsx          # Navigation bar with mobile menu
│   ├── Hero.tsx            # Hero section with CTA
│   ├── HighlightStrip.tsx  # Benefits highlight strip
│   ├── Categories.tsx      # Product categories
│   ├── FeaturedProducts.tsx # Product grid with modal trigger
│   ├── HowItWorks.tsx      # Process steps
│   ├── Testimonials.tsx    # Customer reviews
│   ├── EmailCapture.tsx    # Newsletter signup
│   ├── Footer.tsx          # Footer with links
│   ├── LoginRequiredModal.tsx # Modal for product access
│   ├── AuthForm.tsx        # Reusable login/signup form
│   └── ScrollAnimation.tsx # Scroll-triggered animations
└── package.json
```

## Design System

### Colors
- **Background**: Soft beige (#F7EDE2)
- **Primary Text**: Warm brown (#8C6746)
- **Accent**: Dusty rose (#E3B7C8)

### Typography
- **Font**: Poppins (Google Fonts)
- Clean, rounded sans-serif style

## Key Features

### Login-Required Modal
When users click on any product card or button, a modal appears prompting them to log in or sign up. This prevents navigation to product pages without authentication.

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Grid layouts that adapt to screen size
- Touch-friendly buttons and interactions

### Form Validation
- Client-side validation for login and signup forms
- Real-time error messages
- Accessible form inputs with proper labels

## Future Enhancements

- Connect to backend API
- Add shopping cart functionality
- Implement product detail pages
- Add search and filter functionality
- Integrate payment processing
- Add user dashboard

## License

This project is created for LykkeLoop.



