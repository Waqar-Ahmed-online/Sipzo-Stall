export const FLAVOR_FAMILIES: Record<string, { bg: string; border: string; text: string }> = {
  citrus: { bg: "#FCE8D6", border: "#E8781A", text: "#8A4308" },
  berry: { bg: "#E9E1F7", border: "#5B3E96", text: "#3A275F" },
  lime: { bg: "#E8F2D9", border: "#7CA82E", text: "#3F5518" },
  cola: { bg: "#E3DAD2", border: "#5C3A26", text: "#3A2415" },
  water: { bg: "#DCEEF2", border: "#2E8AA8", text: "#155166" },
  tropical: { bg: "#FFF6D9", border: "#E0A800", text: "#7A5200" },
  rose: { bg: "#FBE1EC", border: "#D6437D", text: "#7A1F45" },
  spice: { bg: "#FDE1D6", border: "#E14A1A", text: "#7A2408" },
};

export const CATEGORIES = [
  "Sodas",
  "Milk Soda",
  "Milk Shake",
  "Falooda",
  "Cold Coffee",
  "Ice Cream",
  "Ice Cream Shake",
  "Chaat",
  "Popcorn",
  "Cotton Candy",
  "Gola Ganda",
  "Fries",
  "Starters",
  "Burger",
];

export const HYDERABAD_AREAS = [
  "Latifabad",
  "Qasimabad",
  "City Area",
  "Hirabad",
  "Saddar",
  "Auto Bhan Road",
  "Thandi Sarak",
  "Shaheen Chowk",
  "Wadhu Wah",
  "Kohsar",
  "Ranchore Line",
  "Sindh University Road",
  "Isra University Road",
  "Other",
];

export const CATEGORY_GROUPS: Record<string, string[]> = {
  "Drinks & Limca": ["Sodas", "Milk Soda", "Cold Coffee", "Gola Ganda"],
  "Shakes & Ice-Cream": ["Milk Shake", "Falooda", "Ice Cream", "Ice Cream Shake", "Cotton Candy"],
  "Fast Food & Snacks": ["Chaat", "Popcorn", "Fries", "Starters", "Burger"],
};

export const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

export const SIZES = ["Small", "Medium", "Large"];
