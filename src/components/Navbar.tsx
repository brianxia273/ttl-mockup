"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CATLogo from "../assets/logo.png";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid";

const baseTabStyles =
  "text-base font-medium hover:text-theme-dk-red cursor-pointer";
const activeStyles = `${baseTabStyles} text-theme-red`;
const nonActiveStyles = `${baseTabStyles} text-text-dk-grey`;

// Asks for confirmation, then signs out and goes to the login page.
async function confirmSignOut(router: ReturnType<typeof useRouter>) {
  if (!window.confirm("Are you sure you want to sign out?")) return false;
  await createClient().auth.signOut();
  router.push("/login");
  router.refresh();
  return true;
}

const profileButtonStyles =
  "text-text-dk-grey hover:text-theme-dk-red cursor-pointer";

function ProfileIcon() {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link href="/login" aria-label="Log in" className={profileButtonStyles}>
        <UserCircleIcon className="h-8 w-8" />
      </Link>
    );
  }

  async function signOut() {
    if (await confirmSignOut(router)) setOpen(false);
  }

  return (
    <div className="relative">
      <button
        aria-label="Profile"
        className={profileButtonStyles}
        onClick={() => setOpen(!open)}
      >
        <UserCircleIcon className="h-8 w-8" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.08)]">
          <p className="text-sm text-text-dk-grey truncate mb-3">
            {user.email}
          </p>
          <button className="btn btn-outline btn-small" onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  type TabProps = {
    routeToPath: string;
    tabName: string;
  };

  const router = useRouter();
  const location = usePathname();
  const { user } = useUser();

  const [showMobileTabs, setShowMobileTabs] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const Tab = ({ routeToPath, tabName }: TabProps) => {
    return (
      <button
        onClick={() => {
          router.push(routeToPath);
          setShowMobileTabs(false);
        }}
        className={`${isActive(routeToPath) ? activeStyles : nonActiveStyles}`}
      >
        {tabName}
      </button>
    );
  };

  const SignOutButton = () => (
    <button
      className={nonActiveStyles}
      onClick={async () => {
        if (await confirmSignOut(router)) setShowMobileTabs(false);
      }}
    >
      Sign Out
    </button>
  );

  function MobileTabs() {
    return (
      <nav
        className={`bg-theme-white/80 fixed inset-0 mt-15 sm:mt-19 md:mt-23 backdrop-blur-xs overflow-y-auto
      ${showMobileTabs ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}`}
      >
        <div className="flex flex-col gap-10 items-end pr-7 py-7">
          <Tab routeToPath="/Home" tabName="Home" />
          <Tab routeToPath="/mytoys" tabName="My Toys" />
          <SignOutButton />
        </div>
      </nav>
    );
  }

  return (
    <>
      <div className="flex fixed top-0 left-0 w-full z-50 justify-between h-16 sm:h-20 md:h-24 bg-white">
        <img
          src={CATLogo.src}
          alt="Cornell Assistive Technologies Logo"
          className="h-full w-auto py-2 pl-5 cursor-pointer"
          onClick={() => {
            router.push("/Home");
          }}
        />
        {/* Tabs only show when logged in */}
        {user && (
          <>
            <nav className="hidden lg:flex justify-end">
              <div className="flex items-center gap-16 mr-20">
                <Tab routeToPath="/Home" tabName="Home" />
                <Tab routeToPath="/mytoys" tabName="My Toys" />
                <SignOutButton />
                {/* <ProfileIcon /> */}
              </div>
            </nav>
            <div className="flex lg:hidden items-center gap-4 pr-5">
              <ProfileIcon />
              <Bars3Icon
                className="flex lg:hidden h-8 sm:h-10 nonActiveStyles"
                onClick={() => {
                  setShowMobileTabs(!showMobileTabs);
                }}
              />
              <MobileTabs />
            </div>
          </>
        )}
      </div>
      {/* Spacer so page content starts below the fixed navbar */}
      <div className="h-16 sm:h-20 md:h-24" />
    </>
  );
}
