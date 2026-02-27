import { create } from "zustand";

interface State {
  rating: number;
  setRating: (value: number) => void;

  text: string;
  setText: (value: string) => void;

  description: string;
  setDescription: (value: string) => void;

  input: string;
  setInput: (value: string) => void;

  place: google.maps.places.Place | null;
  setPlace: (value: google.maps.places.Place | null) => void;

  budget: number;
  setBudget: (value: number) => void;
}

export const useStore = create<State>((set) => ({
  rating: 0,
  setRating: (value) => set({ rating: value }),

  text: "",
  setText: (value) => set({ text: value }),

  description: "",
  setDescription: (value) => set({ description: value }),

  input: "",
  setInput: (value) => set({ input: value }),

  place: null,
  setPlace: (value) => set({ place: value }),

  budget: 0,
  setBudget: (value) => set({ budget: value }),
}));
