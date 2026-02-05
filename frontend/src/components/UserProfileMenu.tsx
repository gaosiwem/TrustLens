"use client";

import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import EditProfileDialog from "./EditProfileDialog";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UserProfileMenu() {
  const { data: session } = useSession();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!session?.user) return null;

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const settingsHref =
    (session.user as any).role === "BRAND"
      ? "/brand/settings"
      : "/dashboard/settings";

  return (
    <>
      <Menu as="div" className="relative ml-3">
        <div>
          <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="sr-only">Open user menu</span>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {userInitials}
            </div>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-[#1a2c34] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm dark:text-gray-300">Signed in as</p>
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {session.user.email}
              </p>
            </div>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href={settingsHref}
                  className={classNames(
                    active ? "bg-gray-100 dark:bg-gray-700 font-bold" : "",
                    "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full text-left transition-colors",
                  )}
                >
                  Settings
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className={classNames(
                    active ? "bg-gray-100 dark:bg-gray-700 font-bold" : "",
                    "block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full text-left transition-colors",
                  )}
                >
                  Edit Profile
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    signOut({ callbackUrl: "/" });
                  }}
                  className={classNames(
                    active ? "bg-gray-100 dark:bg-gray-700" : "",
                    "block px-4 py-2 text-sm text-red-600 dark:text-red-400 w-full text-left",
                  )}
                >
                  Sign Out
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>

      <EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={session.user}
      />
    </>
  );
}
