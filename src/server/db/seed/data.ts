export const CLUBS = [
  { name: "Forge Fit London — Shoreditch", city: "London", country: "UK", capacity: 450 },
  { name: "Forge Fit New York — SoHo", city: "New York", country: "USA", capacity: 600 },
  { name: "Forge Fit Dubai — Marina", city: "Dubai", country: "UAE", capacity: 520 },
  { name: "Forge Fit Mumbai — Bandra", city: "Mumbai", country: "India", capacity: 400 },
  { name: "Forge Fit Singapore — Orchard", city: "Singapore", country: "Singapore", capacity: 380 },
];

export const PLANS = [
  { tier: "basic", name: "Basic", monthly: 29, description: "Gym floor & cardio zone access at your home club." },
  { tier: "standard", name: "Standard", monthly: 49, description: "Adds sauna, group classes and 2 coaching sessions a month." },
  { tier: "premium", name: "Premium", monthly: 79, description: "All zones, pool & lounge, unlimited coaching, 10% store discount." },
  { tier: "vip", name: "VIP", monthly: 149, description: "Every club worldwide, personal trainer, priority booking, 20% store discount." },
] as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  basic: ["Gym floor & cardio zone", "Locker room access", "Forge Fit app", "Cancel anytime"],
  standard: ["Everything in Basic", "Sauna & steam", "Unlimited group classes", "2 coaching sessions / month"],
  premium: ["Everything in Standard", "Pool, lounge & recovery zone", "Unlimited coaching", "10% off the store"],
  vip: ["Access to every global club", "Dedicated personal trainer", "Priority class booking", "20% off + 1 free supplement / month"],
};

type SeedProduct = {
  name: string; brand: string; category: string; price: number; image: string; description: string;
  variants: { name: string; price?: number; stock: number }[];
};

export const PRODUCTS: SeedProduct[] = [
  { name: "Forge Whey Gold Standard", brand: "Forge Nutrition", category: "Protein", price: 59, image: "whey", description: "24g of fast-absorbing whey protein per scoop with 5.5g BCAAs. Mixes clean, no clumps.", variants: [{ name: "Double Chocolate · 2 lb", stock: 42 }, { name: "Vanilla Ice Cream · 2 lb", stock: 30 }, { name: "Double Chocolate · 5 lb", price: 109, stock: 6 }] },
  { name: "Iso Pure Whey Isolate", brand: "Forge Nutrition", category: "Protein", price: 74, image: "isolate", description: "Cold-filtered 90% protein isolate. Zero sugar, lactose-friendly, ideal for lean cuts.", variants: [{ name: "Unflavoured · 2 lb", stock: 25 }, { name: "Cookies & Cream · 2 lb", stock: 4 }] },
  { name: "Creatine Monohydrate", brand: "Forge Nutrition", category: "Performance", price: 29, image: "creatine", description: "Micronised creatine monohydrate, 5g per serving. Proven to boost strength and power output.", variants: [{ name: "Unflavoured · 300 g", stock: 58 }, { name: "Unflavoured · 500 g", price: 42, stock: 3 }] },
  { name: "Ignite Pre-Workout", brand: "Apex Labs", category: "Performance", price: 39, image: "preworkout", description: "200mg caffeine, citrulline and beta-alanine for explosive energy and skin-splitting pumps.", variants: [{ name: "Blue Raspberry · 30 servings", stock: 21 }, { name: "Fruit Punch · 30 servings", stock: 17 }] },
  { name: "Plant Power Vegan Protein", brand: "Verde Athletics", category: "Protein", price: 49, image: "plant-protein", description: "Pea, rice and pumpkin seed blend. 21g complete protein, fully vegan and gluten free.", variants: [{ name: "Chocolate · 2 lb", stock: 19 }, { name: "Vanilla · 2 lb", stock: 12 }] },
  { name: "Hydro Whey Recovery", brand: "Apex Labs", category: "Protein", price: 84, image: "hydro-whey", description: "Hydrolysed whey peptides for the fastest possible post-workout recovery.", variants: [{ name: "Chocolate · 1.6 lb", stock: 9 }] },
  { name: "Ready-to-Drink Protein Shake", brand: "Forge Nutrition", category: "Protein", price: 36, image: "rtd-shake", description: "30g protein shake in a bottle. Grab-and-go fuel, 12-pack.", variants: [{ name: "Strawberry · 12 pack", stock: 33 }, { name: "Chocolate · 12 pack", stock: 27 }] },
  { name: "Forge Steel Shaker 750ml", brand: "Forge Gear", category: "Accessories", price: 19, image: "shaker", description: "Double-wall insulated stainless shaker with leak-proof lid and mixing ball.", variants: [{ name: "Matte Black", stock: 64 }, { name: "Terracotta", stock: 40 }] },
  { name: "Resistance Band Set", brand: "Forge Gear", category: "Accessories", price: 32, image: "bands", description: "Five latex bands from 5 to 45 kg, with door anchor and carry pouch.", variants: [{ name: "5-band set", stock: 45 }] },
  { name: "Core Ab Wheel Pro", brand: "Forge Gear", category: "Accessories", price: 24, image: "ab-wheel", description: "Wide dual-wheel roller with knee pad for a stable, brutal core workout.", variants: [{ name: "Standard", stock: 2 }] },
  { name: "Hex Dumbbell Pair", brand: "Forge Gear", category: "Equipment", price: 45, image: "dumbbells", description: "Rubber-coated hex dumbbells with knurled chrome handles. Sold as a pair.", variants: [{ name: "2 × 5 kg", stock: 18 }, { name: "2 × 10 kg", price: 79, stock: 11 }, { name: "2 × 20 kg", price: 139, stock: 5 }] },
  { name: "Performance Training Jacket", brand: "Forge Apparel", category: "Apparel", price: 89, image: "jacket", description: "Lightweight, sweat-wicking zip jacket with thumbholes and zipped pockets.", variants: [{ name: "S", stock: 12 }, { name: "M", stock: 20 }, { name: "L", stock: 14 }] },
  { name: "Sculpt Seamless Leggings", brand: "Forge Apparel", category: "Apparel", price: 64, image: "leggings", description: "Squat-proof high-waist leggings with four-way stretch and contour seams.", variants: [{ name: "XS", stock: 9 }, { name: "S", stock: 16 }, { name: "M", stock: 13 }] },
  { name: "Athletic Muscle Tank", brand: "Forge Apparel", category: "Apparel", price: 34, image: "tank", description: "Dropped armhole tank in breathable cotton-modal for heavy training days.", variants: [{ name: "M", stock: 22 }, { name: "L", stock: 18 }, { name: "XL", stock: 7 }] },
  { name: "Pulse Wireless Sport Earbuds", brand: "Forge Tech", category: "Accessories", price: 119, image: "earbuds", description: "Sweat-proof IPX7 earbuds with secure ear hooks and 32-hour battery.", variants: [{ name: "Black", stock: 14 }] },
];

type SeedEquipment = {
  name: string; category: string; manufacturer: string; image: string; muscles: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced"; steps: string[]; safety: string;
};

export const EQUIPMENT: SeedEquipment[] = [
  { name: "Olympic Barbell & Squat Rack", category: "Free Weights", manufacturer: "Rogue", image: "barbell", muscles: ["Legs", "Back", "Core"], difficulty: "Intermediate", steps: ["Set the bar at mid-chest height in the rack.", "Step under, place the bar across your upper traps and grip evenly.", "Unrack, take two steps back and set feet shoulder-width apart.", "Brace your core, sit hips back and down until thighs are parallel.", "Drive through mid-foot to stand, keeping chest up."], safety: "Always set the safety pins just below your bottom squat depth. Use collars." },
  { name: "Hex Dumbbells", category: "Free Weights", manufacturer: "Eleiko", image: "dumbbells", muscles: ["Arms", "Chest", "Shoulders"], difficulty: "Beginner", steps: ["Pick a weight you can control for 10–12 reps.", "Keep wrists neutral and elbows slightly bent.", "Move through the full range under control — 2 seconds down, 1 second up.", "Return dumbbells to the rack in the right slot."], safety: "Never drop dumbbells from height; lower them to the floor with control." },
  { name: "Kettlebells", category: "Free Weights", manufacturer: "Rogue", image: "kettlebell", muscles: ["Full Body", "Core", "Legs"], difficulty: "Intermediate", steps: ["Stand with the bell a foot in front of you.", "Hinge at the hips, grip the handle and hike it back.", "Snap the hips forward to float the bell to chest height.", "Let it swing back between your legs and repeat."], safety: "The power comes from your hips, not your arms or lower back." },
  { name: "Cable Crossover Station", category: "Cable", manufacturer: "Technogym", image: "cable-crossover", muscles: ["Chest", "Shoulders", "Arms"], difficulty: "Beginner", steps: ["Set both pulleys to the highest position and attach D-handles.", "Step forward into a split stance, slight lean from the hips.", "With soft elbows, bring the handles together in a hugging arc.", "Squeeze the chest for a second, then return slowly."], safety: "Select a weight that doesn't pull your shoulders forward at the start." },
  { name: "Plate-Loaded Leg Press", category: "Machines", manufacturer: "Hammer Strength", image: "leg-press", muscles: ["Legs"], difficulty: "Beginner", steps: ["Sit with back and hips flat against the pad.", "Place feet hip-width on the platform, mid-height.", "Release the safety handles and lower until knees reach ~90°.", "Press back up without locking your knees."], safety: "Never let your lower back round off the pad. Re-engage safeties before exiting." },
  { name: "Commercial Treadmill", category: "Cardio", manufacturer: "Technogym", image: "treadmill", muscles: ["Legs", "Full Body"], difficulty: "Beginner", steps: ["Clip the safety key to your clothing.", "Start at walking pace for a 3–5 minute warm-up.", "Increase speed or incline gradually.", "Cool down at walking pace before stopping."], safety: "Don't hold the handrails while running; it alters your gait." },
  { name: "Assault Air Bike", category: "Cardio", manufacturer: "Rogue", image: "airbike", muscles: ["Full Body", "Legs"], difficulty: "Intermediate", steps: ["Adjust the seat so your knee is slightly bent at the bottom.", "Push and pull the handles while pedalling.", "For intervals: 20 seconds all-out, 40 seconds easy, repeat 8 times."], safety: "Resistance increases with effort — build up gradually." },
  { name: "Battle Ropes", category: "Functional", manufacturer: "Eleiko", image: "battle-ropes", muscles: ["Shoulders", "Arms", "Core"], difficulty: "Intermediate", steps: ["Hold one rope end in each hand, feet shoulder-width, knees soft.", "Alternate arms quickly to create continuous waves.", "Keep your core tight and back neutral.", "Work in 30-second bursts."], safety: "Keep a slight squat stance to protect your lower back." },
  { name: "Heavy Punch Bag", category: "Functional", manufacturer: "Everlast", image: "heavy-bag", muscles: ["Arms", "Shoulders", "Core"], difficulty: "Beginner", steps: ["Wrap hands and put on bag gloves.", "Stand in a staggered stance with guard up.", "Throw jab–cross combinations, rotating through the hips.", "Move around the bag between combinations."], safety: "Always wear hand wraps to protect wrists and knuckles." },
  { name: "Percussion Recovery Gun", category: "Recovery", manufacturer: "Theragun", image: "recovery-gun", muscles: ["Full Body"], difficulty: "Beginner", steps: ["Choose the round attachment and lowest speed.", "Glide slowly over the muscle for 30–60 seconds.", "Avoid bones, joints and the neck."], safety: "Don't use on injuries, bruises or inflamed areas." },
  { name: "Yoga & Mobility Studio", category: "Recovery", manufacturer: "Manduka", image: "yoga", muscles: ["Core", "Full Body"], difficulty: "Beginner", steps: ["Grab a mat and a block from the rack.", "Follow the on-screen mobility flow or join a class.", "Breathe slowly and hold each position for 30 seconds."], safety: "Move within a pain-free range." },
];

export const TRAINERS = [
  { name: "Marcus Reid", role: "Head of Strength", image: "/images/trainers/trainer-1.jpg", bio: "Former GB weightlifter, 12 years coaching elite athletes." },
  { name: "Sofia Almeida", role: "Mobility & Yoga Lead", image: "/images/trainers/trainer-2.jpg", bio: "E-RYT 500 yoga instructor and physiotherapy graduate." },
  { name: "Daniel Okafor", role: "Performance Coach", image: "/images/trainers/trainer-3.jpg", bio: "CSCS-certified coach specialising in hybrid athletes." },
  { name: "Aisha Rahman", role: "Nutrition & HIIT Coach", image: "/images/trainers/trainer-4.jpg", bio: "Registered sports nutritionist and HIIT specialist." },
];

export const FIRST_NAMES = ["Liam", "Olivia", "Noah", "Emma", "Arjun", "Priya", "Mateo", "Sofia", "Yusuf", "Aaliyah", "Kenji", "Mei", "Lucas", "Chloe", "Omar", "Zara", "Ethan", "Ava", "Rohan", "Isla", "Diego", "Hana", "Leo", "Amara", "Kai", "Nina", "Samir", "Freya", "Ivan", "Leila"];
export const LAST_NAMES = ["Carter", "Patel", "Nakamura", "García", "Okafor", "Müller", "Haddad", "Chen", "Silva", "Kowalski", "Singh", "Laurent", "Andersson", "Kim", "Rossi"];
