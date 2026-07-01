import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: "outerwear" | "tops" | "bottoms" | "accessories";
  gender: "men" | "women" | "unisex";
  image: string;
  alt: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "kf-001",
    sku: "KF/001",
    name: "Void Hood",
    price: 480,
    category: "tops",
    gender: "unisex",
    image: p1,
    alt: "Oversized black hooded sweatshirt on invisible mannequin",
  },
  {
    id: "kf-002",
    sku: "KF/002",
    name: "Chrome Bomber",
    price: 1240,
    category: "outerwear",
    gender: "men",
    image: p2,
    alt: "Black leather bomber jacket lit with green rim light",
  },
  {
    id: "kf-003",
    sku: "KF/003",
    name: "Tactical Cargo",
    price: 620,
    category: "bottoms",
    gender: "men",
    image: p3,
    alt: "Oversized black tactical cargo pants",
  },
  {
    id: "kf-004",
    sku: "KF/004",
    name: "Static Tee",
    price: 210,
    category: "tops",
    gender: "unisex",
    image: p4,
    alt: "Black t-shirt with distressed silver graphic print",
  },
  {
    id: "kf-005",
    sku: "KF/005",
    name: "Wire Trench",
    price: 1680,
    category: "outerwear",
    gender: "women",
    image: p2,
    alt: "Long black overcoat, chrome hardware",
  },
  {
    id: "kf-006",
    sku: "KF/006",
    name: "Barb Sash",
    price: 180,
    category: "accessories",
    gender: "unisex",
    image: p1,
    alt: "Woven black sash accessory",
  },
  {
    id: "kf-007",
    sku: "KF/007",
    name: "Iron Slack",
    price: 540,
    category: "bottoms",
    gender: "women",
    image: p3,
    alt: "Wide-leg black trouser",
  },
  {
    id: "kf-008",
    sku: "KF/008",
    name: "Null Crew",
    price: 320,
    category: "tops",
    gender: "women",
    image: p4,
    alt: "Boxy black knit crewneck",
  },
];
