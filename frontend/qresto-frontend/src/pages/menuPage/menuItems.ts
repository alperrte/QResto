export type ItemCategoryId =
    | "pizza"
    | "burger"
    | "seafood"
    | "salad"
    | "dessert"
    | "soup";

export type MenuCategoryFilterId = ItemCategoryId | "all";

export const MENU_CATEGORIES: {
    id: MenuCategoryFilterId;
    label: string;
    icon: string;
    defaultFill?: boolean;
}[] = [
    { id: "all", label: "Tümü", icon: "restaurant_menu" },
    { id: "pizza", label: "Pizzalar", icon: "local_pizza", defaultFill: true },
    { id: "burger", label: "Burgerler", icon: "lunch_dining" },
    { id: "seafood", label: "Deniz Ürünleri", icon: "set_meal" },
    { id: "salad", label: "Salatalar", icon: "eco" },
    { id: "dessert", label: "Tatlılar", icon: "icecream" },
    { id: "soup", label: "Çorbalar", icon: "soup_kitchen" },
];

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    imageUrl: string;
    prepMinutes: number;
    kcal: number;
    rating: number;
    categoryId: ItemCategoryId;
};

export const SAMPLE_MENU_ITEMS: MenuItem[] = [
    {
        id: "1",
        name: "Izgara Bonfile",
        description:
            "Özel marine edilmiş 250gr dana bonfile, fırınlanmış patates ve mevsim yeşillikleri ile.",
        priceLabel: "₺450",
        imageUrl:
            "https://lh3.googleusercontent.com/aida/ADBb0uiWHYPPQsfTikQRCDJ6iIU6rUI-ne2LQH4OxU5duuM1DMMOjtgcJZ8d06UJ2n0l8vwua9a10ExWqvNr2SCaoMnZ1LywJSmlFoq2blYGvZ_rMxymZx4oRQsJzvic3eVNP-jmonqw--V-2QSJEWm1GgoJwDwr25-W6Hvbnra6VPZ0B-SZF_Aq894kJp8mePM-O-eLBsQPURE1boZxyhUpRg56vKfWk6yhAqist4YeRdpzA3VH1PzecmI57QNCZsk-4Dl9aRXM9KQclA",
        prepMinutes: 25,
        kcal: 650,
        rating: 4.8,
        categoryId: "burger",
    },
    {
        id: "2",
        name: "Pesto Soslu Makarna",
        description:
            "Ev yapımı fesleğenli pesto sos, parmesan, çam fıstığı ve sızma zeytinyağı.",
        priceLabel: "₺220",
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCqNAddTdVidpmB_dLBQ9r042ZkScz6zLCymQtFr0EDRx93RQaGBiwL3sCB39rQIvTUpjifRcYzvRpXPAPp0Hf41mzkjeZgWg9Fm9uKNTfH6kLuc4a6s7v_3B_ZAc7Qrii5MIOYZNODWNByZL4rLqb1oHNdE7qnb7eGMwnP8pmwH4bLmXYzxwtQKoXs2HttGw2h9msw_mFlVZ8HJFEFP2bpDPruXPRS1qkChyniWsqlf0A9Jhjhqzj2JordF_-pfsGbT9WY7tNOVxwu",
        prepMinutes: 15,
        kcal: 480,
        rating: 4.5,
        categoryId: "pizza",
    },
    {
        id: "3",
        name: "Günün çorbası",
        description: "Mevsim sebzeleri ile hazırlanan sıcak çorba.",
        priceLabel: "₺85",
        imageUrl:
            "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
        prepMinutes: 12,
        kcal: 180,
        rating: 4.6,
        categoryId: "soup",
    },
    {
        id: "4",
        name: "Izgara köfte",
        description:
            "Özel baharatlarla marine edilmiş dana köfte, pilav ve salata ile.",
        priceLabel: "₺320",
        imageUrl:
            "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80",
        prepMinutes: 22,
        kcal: 620,
        rating: 4.7,
        categoryId: "burger",
    },
    {
        id: "5",
        name: "Sezar salata",
        description: "Marul, parmesan, kruton ve ev yapımı sos.",
        priceLabel: "₺195",
        imageUrl:
            "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80",
        prepMinutes: 10,
        kcal: 320,
        rating: 4.4,
        categoryId: "salad",
    },
    {
        id: "6",
        name: "Fırın sütlaç",
        description: "Geleneksel tarif, fırında kızarmış üstü ile.",
        priceLabel: "₺95",
        imageUrl:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
        prepMinutes: 8,
        kcal: 280,
        rating: 4.9,
        categoryId: "dessert",
    },
];

export function getMenuItemById(itemId: string | undefined): MenuItem | undefined {
    if (!itemId) return undefined;
    return SAMPLE_MENU_ITEMS.find((item) => item.id === itemId);
}
