/** 방명록 · 저장한 장소 · 인증 관련 타입 */

/** 방명록 후기. Supabase public.reviews 한 행에 대응한다. */
export type Review = {
  id: string;
  /** 작성자 (auth.users.id). 수정·삭제 권한 판단 기준 */
  userId: string;
  nickname: string;
  content: string;
  /** 작성 일시 (ISO 문자열) */
  createdAt: string;
  /** 수정 일시 (ISO 문자열). 수정된 적 없으면 createdAt 과 같다 */
  updatedAt: string;
  /** 시·도 축약 표기 (lib/guestbook.ts sidoOf 결과) */
  region: string;
};

/** 저장한 장소. 목록 화면 표시에 필요한 정보를 함께 보관한다. */
export type SavedPlace = {
  id: string;
  destinationId: string;
  destinationName: string;
  region: string;
  image: string | null;
  shortDescription: string | null;
  createdAt: string;
};

/** 로그인한 사용자 */
export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
};
