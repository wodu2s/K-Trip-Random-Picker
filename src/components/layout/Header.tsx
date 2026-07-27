"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { label: "서비스 소개", href: "/#intro" },
  { label: "사용 방법", href: "/#how" },
  { label: "추천 여행지", href: "/#recommend" },
  { label: "숨은 명소", href: "/#hidden" },
];

/**
 * 전역 헤더 — 로고 + 네비게이션 + 로그인/회원가입.
 * 데스크톱: 가로 배치 / 모바일: 햄버거 메뉴.
 * (로그인·회원가입은 프로토타입 범위 밖 → 자리표시 버튼)
 */
export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* 데스크톱 네비게이션 */}
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="주요 메뉴"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[15px] font-semibold text-ink/80 transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 데스크톱 인증 버튼 */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="secondary" size="sm">
            로그인
          </Button>
          <Button variant="primary" size="sm">
            회원가입
          </Button>
        </div>

        {/* 모바일 햄버거 */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {open && (
        <div className="border-t border-line/60 bg-surface md:hidden">
          <nav
            className="mx-auto flex max-w-content flex-col gap-1 px-4 py-3"
            aria-label="모바일 메뉴"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-3 text-base font-semibold text-ink/80 hover:bg-background hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1">
                로그인
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                회원가입
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
