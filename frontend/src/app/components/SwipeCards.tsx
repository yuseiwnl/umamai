"use client";

import { ImageItem } from "@/lib/FetchImages";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaInfoCircle } from "react-icons/fa";
import HeartPopup from "./HeartPopup";
import { useSupabaseSession } from "@/lib/supabase";
import { hasUserLiked, likePost } from "@/lib/likePost";
import Link from "next/link";
import LoginModal from "@/lib/loginModal";
import { ExpandableDescription } from "./ExpandableDescription";

type SwipeCardsProps = {
  cardData: ImageItem[];
};

const INITIAL_BATCH_SIZE = 20;
const LOAD_BATCH_SIZE = 10;
const LOAD_MORE_THRESHOLD = 5;

export default function SwipeCards({ cardData }: SwipeCardsProps) {
  const user = useSupabaseSession()?.user;
  const shuffle = useCallback(
    (arr: ImageItem[]) =>
      arr
        .map((v) => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map((o) => o.v),
    []
  );

  const [cards, setCards] = useState<ImageItem[]>(() => shuffle([...cardData]));
  const [showHeart, setShowHeart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [offset, setOffset] = useState(cardData.length);
  const [hasMore, setHasMore] = useState(cardData.length >= INITIAL_BATCH_SIZE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Combine randomness and proximity to user into a score
  const RANDOM_WEIGHT = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_SWIPE_RANDOM_WEIGHT;
    const parsed = raw ? parseFloat(raw) : NaN;
    // Default to 0.5 if not set or invalid
    return Number.isFinite(parsed)
      ? Math.min(0.95, Math.max(0.05, parsed))
      : 0.5;
  }, []);

  const haversineKm = (
    lat1?: number | null,
    lon1?: number | null,
    lat2?: number | null,
    lon2?: number | null
  ): number | null => {
    if (
      lat1 == null ||
      lon1 == null ||
      lat2 == null ||
      lon2 == null ||
      !Number.isFinite(lat1) ||
      !Number.isFinite(lon1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2)
    )
      return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Optionally reorder by geolocation later; disabled by default to avoid visible re-sorting
  const GEO_REORDER = process.env.NEXT_PUBLIC_SWIPE_GEO_REORDER === "true";

  // Shuffle immediately after mount/when new data arrives (fast, no geolocation wait)
  useEffect(() => {
    const shuffled = shuffle([...cardData]);
    setCards(shuffled);
    setOffset(cardData.length);
    setHasMore(cardData.length >= INITIAL_BATCH_SIZE);
  }, [cardData, shuffle]);

  // On mount, attempt to reorder cards by a proximity-weighted random score
  useEffect(() => {
    if (!GEO_REORDER) return; // keep the initial random order for instant UX
    let canceled = false;

    const reorder = (pos?: GeolocationPosition) => {
      const userLat = pos?.coords?.latitude ?? null;
      const userLng = pos?.coords?.longitude ?? null;

      const scored = cardData.map((img) => {
        // Some backends may provide lat/lng as strings; coerce safely
        const rawLat = (img.restaurant as any)?.lat as
          | number
          | string
          | null
          | undefined;
        const rawLng = (img.restaurant as any)?.lng as
          | number
          | string
          | null
          | undefined;
        const rLat =
          typeof rawLat === "string" ? parseFloat(rawLat) : rawLat ?? null;
        const rLng =
          typeof rawLng === "string" ? parseFloat(rawLng) : rawLng ?? null;

        const dKm = haversineKm(userLat, userLng, rLat, rLng);
        // Proximity score: closer = higher (1 at same spot, ~0 as very far)
        const proximity = dKm == null ? 0.5 : 1 / (1 + dKm);
        const random = Math.random();
        const score = RANDOM_WEIGHT * random + (1 - RANDOM_WEIGHT) * proximity;
        return { img, score };
      });

      // Stable sort by score desc, then by uuid to be deterministic for equal scores
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.img.uuid.localeCompare(b.img.uuid);
      });

      if (!canceled) setCards(scored.map((s) => s.img));
    };

    if (typeof window !== "undefined" && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => reorder(pos),
        () => {
          // If geolocation fails, fall back to random shuffle
          const shuffled = shuffle([...cardData]);
          if (!canceled) setCards(shuffled);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      // No geolocation available; random order
      const shuffled = shuffle([...cardData]);
      if (!canceled) setCards(shuffled);
    }

    return () => {
      canceled = true;
    };
    // We want to run this once on mount for the provided cardData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData, RANDOM_WEIGHT, GEO_REORDER]);

  const fetchMoreCards = useCallback(async () => {
    if (isFetchingMore || !hasMore) {
      return;
    }

    setIsFetchingMore(true);
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: LOAD_BATCH_SIZE.toString(),
      });
      const response = await fetch(`/api/images?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch more images: ${response.status}`);
      }

      const payload = await response.json();
      const incoming: ImageItem[] = Array.isArray(payload?.data)
        ? payload.data
        : [];

      if (incoming.length > 0) {
        const shuffledIncoming = shuffle([...incoming]);
        const prepared = [...shuffledIncoming].reverse();

        setCards((prev) => {
          if (!prev.length) {
            return prepared;
          }
          return [...prepared, ...prev];
        });

        setOffset((prev) => prev + incoming.length);
        if (incoming.length < LOAD_BATCH_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load additional images:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, offset, shuffle]);

  useEffect(() => {
    if (cards.length <= LOAD_MORE_THRESHOLD && hasMore) {
      void fetchMoreCards();
    }
  }, [cards.length, fetchMoreCards, hasMore]);

  const handleSwipe = useCallback(
    async (id: string) => {
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      const alreadyLiked = await hasUserLiked(user.id, id);
      if (!alreadyLiked) {
        await likePost(user.id, id);
        console.log("liked image: " + id);
      }

      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    },
    [user]
  );

  // [touch-action:pan-x] prevents users from scrolling vertically while swiping cards
  return (
    <div className="[touch-action:pan-x]">
      <div className="grid">
        {cards.map((card, i) => (
          <Card
            key={card.uuid}
            index={i}
            cards={cards}
            setCards={setCards}
            image={card}
            onSwipe={handleSwipe}
            requiresLogin={!user}
            onRequireLogin={() => setShowLoginModal(true)}
          />
        ))}
      </div>
      {cards.length === 0 && (
        <div className="mt-8 text-center text-gray-200">
          {isFetchingMore
            ? "Loading more images..."
            : "No more images available right now."}
        </div>
      )}
      {showHeart && <HeartPopup />}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

type CardProps = {
  image: ImageItem;
  cards: ImageItem[];
  setCards: Dispatch<SetStateAction<ImageItem[]>>;
  index: number;
  onSwipe: (id: string) => void;
  requiresLogin: boolean;
  onRequireLogin: () => void;
};

const Card = ({
  image,
  cards,
  setCards,
  index,
  onSwipe,
  requiresLogin,
  onRequireLogin,
}: CardProps) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-125, 0, 125], [0, 1, 0]);
  const rotate = useTransform(x, [-125, 125], [-15, 15]);
  const promptedLoginRef = useRef(false);

  const handleDragStart = () => {
    promptedLoginRef.current = false;
  };

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!requiresLogin) return;
    if (promptedLoginRef.current) return;

    const offsetX = Math.max(-125, Math.min(125, info.offset.x));
    const simulatedRotation = (offsetX / 125) * 45;

    if (simulatedRotation >= 45) {
      promptedLoginRef.current = true;
      onRequireLogin();
      x.stop();
      x.set(0);
    }
  };

  const handleDragEnd = () => {
    if (requiresLogin && promptedLoginRef.current) {
      promptedLoginRef.current = false;
      x.stop();
      x.set(0);
      return;
    }

    if (Math.abs(x.get()) > 100) {
      if (x.get() > 100) {
        onSwipe(image.uuid);
      }

      setCards((pv) => pv.filter((v) => v.uuid !== image.uuid));
    }
  };

  const zIndex = index;

  return (
    <motion.div
      style={{
        position: "absolute", // Required for rounded corners
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        zIndex,
      }}
      drag="x"
      dragConstraints={{
        left: 0,
        right: 0,
      }}
      dragElastic={0.65}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="w-full h-full rounded-xl overflow-hidden"
    >
      {/*w-full h-full required for fill*/}
      <Image
        src={image.image_url}
        alt="placeholder"
        fill
        className="object-cover"
        priority={index === cards.length - 1}
        loading={index === cards.length - 1 ? "eager" : "lazy"}
      />

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-10" />
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between text-white">
        <div>
          <div className="text-xl font-semibold">{image.name}</div>
          <ExpandableDescription text={image.description} />
        </div>
        <Link
          href={`/details/${image.uuid}`}
          prefetch
          className="inline-flex items-center justify-center rounded-full"
          data-tutorial-target="info-button"
        >
          <FaInfoCircle className="text-4xl hover:text-gray-200" />
        </Link>
      </div>
    </motion.div>
  );
};
