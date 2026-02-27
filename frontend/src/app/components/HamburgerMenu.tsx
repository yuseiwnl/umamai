"use client";

import { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/lib/supabase";

function itemClasses(active: boolean) {
  return [
    "block w-full text-left px-4 py-2 text-sm",
    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
  ].join(" ");
}

export default function HamburgerMenu() {
  const router = useRouter();

  const go = (path: string) => router.push(path);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("");
  };

  return (
    <div className="fixed top-3 right-3 z-[200]">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          aria-label="Open menu"
          data-tutorial-target="menu-button"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-white backdrop-blur hover:bg-black/70"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-1 shadow-xl ring-1 ring-black/5 focus:outline-none">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={itemClasses(focus)}
                  onClick={() => go("/liked")}
                >
                  Liked Posts
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ focus }) => (
                <button
                  className={itemClasses(focus)}
                  onClick={() => go("/upload")}
                >
                  Upload
                </button>
              )}
            </MenuItem>

            {
              <MenuItem>
                {({ focus }) => (
                  <button
                    className={itemClasses(focus)}
                    onClick={() => go("/profile")}
                  >
                    Profile
                  </button>
                )}
              </MenuItem>
            }

            <div className="my-1 h-px bg-gray-200" />

            <MenuItem>
              {({ focus }) =>
                useSupabaseSession() ? (
                  <button className={itemClasses(focus)} onClick={signOut}>
                    Log Out
                  </button>
                ) : (
                  <button
                    className={itemClasses(focus)}
                    onClick={() => go("/auth/login")}
                  >
                    Login
                  </button>
                )
              }
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
