# Food Hub

## Current State

The workspace contains a basic Caffeine project scaffold with:
- Frontend setup with React, TypeScript, and Tailwind CSS
- shadcn/ui component library installed
- Internet Identity integration configured
- Basic project structure (src/frontend, src/backend)
- No App.tsx file or backend implementation yet
- No application-specific features implemented

## Requested Changes (Diff)

### Add
- Complete Food Hub application for discovering and ordering food from local restaurants
- User authentication using Internet Identity
- Restaurant listing and browsing functionality
- Menu browsing with categories (appetizers, mains, desserts, beverages)
- Shopping cart system
- Order placement and management
- Restaurant owner dashboard for managing menus and orders
- Order status tracking (pending, preparing, ready, delivered)
- User profile with order history
- Search and filter functionality for restaurants and menu items

### Modify
- N/A (new application)

### Remove
- N/A (new application)

## Implementation Plan

### Backend (Motoko)
1. User management system with role-based access (customer, restaurant owner)
2. Restaurant data model (name, description, cuisine type, rating, delivery time)
3. Menu item data model (name, description, price, category, restaurant association, image URL)
4. Shopping cart functionality (add/remove items, update quantities, calculate totals)
5. Order management system (create orders, update order status, retrieve order history)
6. Query functions for restaurants (list all, search by name/cuisine, get by ID)
7. Query functions for menu items (by restaurant, by category, search)
8. Authorization checks (restaurant owners can only modify their own data)

### Frontend (React + TypeScript)
1. App.tsx with routing structure (Home, Restaurants, Menu, Cart, Orders, Dashboard)
2. Home page with featured restaurants and search functionality
3. Restaurant listing page with filters (cuisine type, rating, delivery time)
4. Restaurant detail page showing menu organized by categories
5. Shopping cart UI with item list, quantity controls, and checkout button
6. Order confirmation and tracking page
7. User profile page with order history
8. Restaurant owner dashboard for menu management and order processing
9. Responsive design optimized for mobile and desktop
10. Toast notifications for user actions (added to cart, order placed, etc.)

### Caffeine Components
- Authorization component for role-based access control (customer vs restaurant owner)

## UX Notes

- Clean, modern food delivery app aesthetic
- Prominent restaurant images and menu item photos
- Clear pricing and delivery time information
- Simple cart management with persistent state
- Real-time order status updates
- Easy navigation between browsing and cart
- Restaurant owners get dedicated dashboard for managing their business
- Mobile-first responsive design
- Clear visual hierarchy with cuisine categories and restaurant ratings
