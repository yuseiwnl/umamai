import HomeExperience from "./components/HomeExperience";
import { fetchImages } from "@/lib/FetchImages";

export default async function HomePage() {
  const fetchedImages = await fetchImages({ limit: 20 });
  console.log(
    "Fetched images:",
    fetchedImages.map((img) => img.image_url)
  );

  return <HomeExperience cardData={fetchedImages} />;
}
