import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { tryCatch } from "@/lib/try-catch";

const categoryData = [
  {
    name: "Music",
    description: "Videos related to music, songs, and performances.",
  },
  {
    name: "Gaming",
    description: "Gameplay, walkthroughs, and gaming-related content.",
  },
  {
    name: "Education",
    description: "Educational videos, tutorials, and how-to guides.",
  },
  {
    name: "Comedy",
    description: "Funny videos, sketches, and stand-up comedy.",
  },
  {
    name: "Sports",
    description: "Sports highlights, news, and related content.",
  },
  {
    name: "News",
    description: "News updates, reports, and current events.",
  },
  {
    name: "Technology",
    description: "Tech reviews, tutorials, and gadget news.",
  },
  {
    name: "Lifestyle",
    description: "Vlogs, fashion, and lifestyle-related content.",
  },
  {
    name: "Travel",
    description: "Travel vlogs, guides, and destination reviews.",
  },
  {
    name: "Food",
    description: "Cooking tutorials, recipes, and food reviews.",
  },
  {
    name: "Health & Fitness",
    description: "Workout routines, health tips, and fitness guides.",
  },
  {
    name: "Movies & TV",
    description: "Movie trailers, reviews, and TV show discussions.",
  },
  {
    name: "Science & Nature",
    description: "Videos about science, nature, and the environment.",
  },
  {
    name: "Art & Design",
    description: "Creative content, art tutorials, and design inspiration.",
  },
];

const seedPromise = db.insert(categoryTable).values(categoryData);

const { data, error } = await tryCatch(seedPromise);

if (error) {
  // biome-ignore lint/suspicious/noConsole: log for user info
  console.error("Error seeding categories:", error.message);
  process.exit(1);
}

// biome-ignore lint/suspicious/noConsole: log for user info
console.info(`Seeded ${data.count} categories successfully.`);
process.exit(0);
