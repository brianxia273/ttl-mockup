import { useLocation, useNavigate } from "react-router-dom";
import CATLogo from "../assets/logo.png";
import { useState } from "react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/solid";

const baseTabStyles =
  "text-base font-medium hover:text-theme-dk-red cursor-pointer";
const activeStyles = `${baseTabStyles} text-theme-red`;
const nonActiveStyles = `${baseTabStyles} text-text-dk-grey`;

function ProfileIcon() {
  return (
    <button aria-label="Profile" className="text-text-dk-grey hover:text-theme-dk-red cursor-pointer">
      <UserCircleIcon className="h-8 w-8" />
    </button>
  );
}

export function Navbar() {
  type TabProps = {
    routeToPath: string;
    tabName: string;
  };

  const navigate = useNavigate();
  const location = useLocation().pathname;

  const [showMobileTabs, setShowMobileTabs] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location === path;
  };

  const Tab = ({ routeToPath, tabName }: TabProps) => {
    return (
      <button
        onClick={() => {
          navigate(routeToPath);
          setShowMobileTabs(false);
        }}
        className={`${isActive(routeToPath) ? activeStyles : nonActiveStyles}`}
      >
        {tabName}
      </button>
    );
  };

  function MobileTabs() {
    return (
      <nav
        className={`bg-theme-white/80 fixed inset-0 mt-15 sm:mt-19 md:mt-23 backdrop-blur-xs overflow-y-auto
      ${showMobileTabs ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}`}
      >
        <div className="flex flex-col gap-10 items-end pr-7 py-7">
          <Tab routeToPath="/" tabName="Home" />
          <Tab routeToPath="/mytoys" tabName="My Toys" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <div className="flex fixed top-0 left-0 w-full z-50 justify-between h-16 sm:h-20 md:h-24 bg-white">
        <img
          src={CATLogo}
          alt="Cornell Assistive Technologies Logo"
          className="h-full w-auto py-2 pl-5 cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        />
        <nav className="hidden lg:flex justify-end">
          <div className="flex items-center gap-16 mr-20">
            <Tab routeToPath="/" tabName="Home" />
            <Tab routeToPath="/mytoys" tabName="My Toys" />
            <ProfileIcon />
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
      </div>
      {/* Spacer so page content starts below the fixed navbar */}
      <div className="h-16 sm:h-20 md:h-24" />
    </>
  );
}
