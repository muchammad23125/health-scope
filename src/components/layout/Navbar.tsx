"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {

  const pathname = usePathname();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const menuClass = (path: string) =>
    pathname === path
      ? `
        relative
        text-[16px]
        font-semibold
        text-[#0F766E]

        after:absolute
        after:left-0
        after:-bottom-2
        after:w-full
        after:h-[3px]
        after:bg-[#0F766E]
        after:rounded-full
      `
      : `
        relative
        text-[16px]
        font-medium
        text-slate-700
        hover:text-[#0F766E]
        transition-all
        duration-300
      `;

  return (

    <header
      className="
        sticky
        top-0
        z-50

        bg-white/90
        backdrop-blur-xl

        border-b
        border-slate-200
      "
    >

      {/* CONTAINER */}

      <div
        className="
          max-w-7xl
          mx-auto

          px-4
          sm:px-6
          lg:px-8

          h-[80px]
          md:h-[92px]

          flex
          items-center
          justify-between
        "
      >

        {/* LOGO */}

        <div
          className="
            flex
            items-center
            gap-3
            md:gap-4
          "
        >

          {/* ICON */}

          <div
            className="
              w-11
              h-11

              md:w-14
              md:h-14

              rounded-2xl

              bg-gradient-to-br
              from-[#0F766E]
              to-[#14B8A6]

              flex
              items-center
              justify-center

              shadow-lg
            "
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="
                w-6
                h-6

                md:w-8
                md:h-8

                text-white
              "
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v8m4-4H8m12 0A9 9 0 1112 3a9 9 0 019 9z"
              />

            </svg>

          </div>

          {/* TEXT */}

          <div>

            <h1
              className="
                text-[22px]
                sm:text-[26px]
                md:text-[30px]

                leading-none
                font-extrabold
                text-slate-900
              "
            >
              Health Scope
            </h1>

            <p
              className="
                hidden
                sm:block

                mt-1
                text-sm
                text-slate-500
              "
            >
              Early Warning Disease System Indonesia
            </p>

          </div>

        </div>

        {/* DESKTOP MENU */}

        <nav
          className="
            hidden
            lg:flex
            items-center
            gap-10
          "
        >

          <Link
            href="/"
            className={menuClass("/")}
          >
            Home
          </Link>

          <Link
            href="/prediksi-wabah"
            className={menuClass("/prediksi-wabah")}
          >
            Prediksi Wabah
          </Link>

          <Link
            href="/dampak-sistem"
            className={menuClass("/dampak-sistem")}
          >
            Dampak Sistem
          </Link>

          <Link
            href="/edukasi"
            className={menuClass("/edukasi")}
          >
            Edukasi
          </Link>

          <Link
            href="/berita"
            className={menuClass("/berita")}
          >
            Berita Kesehatan
          </Link>

        </nav>

        {/* HAMBURGER */}

        <button
          type="button"
          onClick={() => setMobileMenu((prev) => !prev)}
          className="
            lg:hidden
            w-11
            h-11
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-all
            duration-300
          "
          aria-label="Toggle Mobile Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenu ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

      </div>

      {/* MOBILE MENU */}

      <div
        className={`

          lg:hidden

          overflow-hidden

          transition-all
          duration-300
          ease-in-out

          ${mobileMenu
            ? "max-h-[400px]"
            : "max-h-0"}

        `}
      >

        <nav
          className="
            px-6
            pb-6

            flex
            flex-col
            gap-5

            bg-white
          "
        >

          <Link
            href="/"
            onClick={() =>
              setMobileMenu(false)
            }
            className={menuClass("/")}
          >
            Home
          </Link>

          <Link
            href="/prediksi-wabah"
            onClick={() =>
              setMobileMenu(false)
            }
            className={menuClass("/prediksi-wabah")}
          >
            Prediksi Wabah
          </Link>

          <Link
            href="/dampak-sistem"
            onClick={() =>
              setMobileMenu(false)
            }
            className={menuClass("/dampak-sistem")}
          >
            Dampak Sistem
          </Link>

          <Link
            href="/edukasi"
            onClick={() =>
              setMobileMenu(false)
            }
            className={menuClass("/edukasi")}
          >
            Edukasi
          </Link>

          <Link
            href="/berita"
            onClick={() =>
              setMobileMenu(false)
            }
            className={menuClass("/berita")}
          >
            Berita Kesehatan
          </Link>

        </nav>

      </div>

    </header>

  );

}