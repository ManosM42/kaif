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