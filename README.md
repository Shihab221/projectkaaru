# ProjectKaru 🎨

> Custom 3D Printed Products E-Commerce Platform

A modern, full-stack e-commerce website for selling 3D printed products like home decor, keychains, organizers, and more.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **Modern E-Commerce**: Product listings, cart, checkout, orders
- **User Authentication**: JWT-based auth with role-based access
- **Admin Dashboard**: Product management, orders, categories, analytics
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Redux State Management**: Cart, auth, and products with Redux Toolkit
- **MongoDB Database**: Mongoose ODM with proper schemas
- **Real-time Cart**: Sidebar cart with live updates
- **WhatsApp Integration**: Direct chat for custom orders

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Redux Toolkit
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Icons**: Lucide React

## 📁 Project Structure

```
kaaru/
├── app/
│   ├── page.tsx              # Home page
│   ├── products/             # Products listing & detail
│   ├── auth/                 # Login/Signup
│   ├── admin/                # Admin dashboard
│   ├── api/                  # API routes
│   │   ├── auth/            # Auth endpoints
│   │   ├── products/        # Product endpoints
│   │   ├── categories/      # Category endpoints
│   │   └── admin/           # Admin endpoints
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/               # Header, Footer
│   ├── home/                 # Hero, Categories, etc.
│   ├── cart/                 # Cart sidebar
│   └── ui/                   # Reusable components
├── redux/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/               # Cart, Auth, Products
├── models/                   # Mongoose schemas
├── lib/                      # Utils, constants, db
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/kaaru.git
cd kaaru
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env


4. **Seed the database (optional)**
```bash
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with sample data
```

## 🎨 Design System

### Colors
- **Primary (Red)**: #ed1c24
- **Background**: #F5F5F5
- **Secondary**: #1a1a1a
- **Success/Focus**: #00FF00

### Typography
- Font: Poppins (Google Fonts)
- Weights: 300-800

## 📱 Pages

1. **Home** (`/`)
   - Hero slider
   - Categories grid
   - Top products
   - Features section

2. **Products** (`/products`)
   - Filterable product grid
   - Search, sort, pagination
   - Category filtering

3. **Product Detail** (`/products/[slug]`)
   - Image gallery
   - Color selection (for keychains)
   - Quantity selector
   - Related products

4. **Auth** (`/auth`)
   - Login/Signup tabs
   - JWT authentication

5. **Admin** (`/admin`)
   - Dashboard with stats
   - Product management
   - Order management
   - Category management

## 🔐 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[slug]` - Get single product

### Categories
- `GET /api/categories` - List all categories

### Admin
- `POST /api/admin/products` - Create product
- `GET /api/admin/products` - List all products

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy!

### Manual

```bash
npm run build
npm run start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

---

Built with ❤️ by ProjectKaru Team

