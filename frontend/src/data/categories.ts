export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  subcategories: Subcategory[];
}

export const CATEGORY_DATA: Category[] = [
  {
    id: "automotive",
    name: "Automotive",
    icon: "directions_car",
    slug: "automotive",
    subcategories: [
      { name: "Car Dealerships", slug: "car-dealerships" },
      { name: "Mechanics & Repairs", slug: "mechanics" },
      { name: "Car Parts", slug: "car-parts" },
    ],
  },
  {
    id: "finance",
    name: "Finance & Insurance",
    icon: "account_balance",
    slug: "finance",
    subcategories: [
      { name: "Banks", slug: "banks" },
      { name: "Insurance", slug: "insurance" },
      { name: "Fintech", slug: "fintech" },
    ],
  },
  {
    id: "technology",
    name: "Tech & Software",
    icon: "devices",
    slug: "technology",
    subcategories: [
      { name: "Electronics", slug: "electronics" },
      { name: "SaaS", slug: "saas" },
      { name: "Web Services", slug: "web-services" },
    ],
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    icon: "shopping_bag",
    slug: "retail",
    subcategories: [
      { name: "Fashion", slug: "fashion" },
      { name: "Groceries", slug: "groceries" },
      { name: "Home & Garden", slug: "home-garden" },
    ],
  },
  {
    id: "travel",
    name: "Travel & Leisure",
    icon: "flight_takeoff",
    slug: "travel",
    subcategories: [
      { name: "Hotels", slug: "hotels" },
      { name: "Airlines", slug: "airlines" },
      { name: "Events", slug: "events" },
    ],
  },
  {
    id: "healthcare",
    name: "Health & Medical",
    icon: "medical_services",
    slug: "healthcare",
    subcategories: [
      { name: "Hospitals", slug: "hospitals" },
      { name: "Pharmacies", slug: "pharmacies" },
      { name: "Wellness", slug: "wellness" },
    ],
  },
];
