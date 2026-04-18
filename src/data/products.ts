import w1 from "@/assets/watch-1.png";
import w2 from "@/assets/watch-2.png";
import w3 from "@/assets/watch-3.png";
import w4 from "@/assets/watch-4.png";
import w5 from "@/assets/watch-5.png";
import w6 from "@/assets/watch-6.png";

export type Category = "men" | "women" | "unisex";
export type Style = "casual" | "formal" | "sports";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: Category;
  style: Style;
  badges?: ("new" | "bestseller")[];
  rating: number;
  description: string;
  specs: { label: string; value: string }[];
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Aurum Classic",
    tagline: "Timeless steel elegance",
    price: 1299,
    oldPrice: 1499,
    image: w1,
    category: "men",
    style: "formal",
    badges: ["new"],
    rating: 5,
    description:
      "A precision-engineered classic, the Aurum Classic pairs a sapphire crystal face with a polished stainless bracelet for understated authority.",
    specs: [
      { label: "Movement", value: "Swiss automatic" },
      { label: "Case", value: "40mm stainless steel" },
      { label: "Water resistance", value: "100m" },
    ],
  },
  {
    id: "p2",
    name: "Sienna Heritage",
    tagline: "Rose gold heritage chronograph",
    price: 1899,
    image: w2,
    category: "men",
    style: "formal",
    badges: ["bestseller"],
    rating: 5,
    description:
      "An elevated chronograph dressed in rose gold and supple Italian leather—engineered for the boardroom and beyond.",
    specs: [
      { label: "Movement", value: "Automatic chronograph" },
      { label: "Case", value: "42mm rose gold PVD" },
      { label: "Strap", value: "Italian calf leather" },
    ],
  },
  {
    id: "p3",
    name: "Onyx Sport",
    tagline: "Tactical chronograph",
    price: 989,
    oldPrice: 1099,
    image: w3,
    category: "men",
    style: "sports",
    badges: ["new", "bestseller"],
    rating: 4,
    description:
      "Built for performance. The Onyx Sport features a robust matte black case and tactical chronograph complications.",
    specs: [
      { label: "Movement", value: "Quartz chronograph" },
      { label: "Case", value: "44mm DLC steel" },
      { label: "Water resistance", value: "200m" },
    ],
  },
  {
    id: "p4",
    name: "Lumière Diamond",
    tagline: "Diamond bezel dress watch",
    price: 2499,
    image: w4,
    category: "women",
    style: "formal",
    badges: ["bestseller"],
    rating: 5,
    description:
      "A jewel for the wrist. Hand-set diamonds frame a mother-of-pearl dial, finished with a soft white leather strap.",
    specs: [
      { label: "Movement", value: "Swiss quartz" },
      { label: "Case", value: "32mm 18k gold plated" },
      { label: "Bezel", value: "62 brilliant diamonds" },
    ],
  },
  {
    id: "p5",
    name: "Azure Mariner",
    tagline: "Sunburst blue dive watch",
    price: 1399,
    image: w5,
    category: "men",
    style: "casual",
    rating: 4,
    description:
      "A nod to nautical heritage. The Azure Mariner pairs a deep sunburst blue dial with a brushed steel bracelet.",
    specs: [
      { label: "Movement", value: "Automatic" },
      { label: "Case", value: "41mm steel" },
      { label: "Water resistance", value: "300m" },
    ],
  },
  {
    id: "p6",
    name: "Mesh Minimal",
    tagline: "Unisex minimalist mesh",
    price: 459,
    oldPrice: 549,
    image: w6,
    category: "unisex",
    style: "casual",
    badges: ["new"],
    rating: 4,
    description:
      "Pure form. The Mesh Minimal strips back complications to reveal a clean dial paired with a Milanese mesh band.",
    specs: [
      { label: "Movement", value: "Japanese quartz" },
      { label: "Case", value: "38mm brushed steel" },
      { label: "Strap", value: "Milanese mesh" },
    ],
  },
];

export const bestSellers = products.filter((p) => p.badges?.includes("bestseller"));
