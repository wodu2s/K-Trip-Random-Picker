/** TourAPI KorService2 원본 아이템. 모든 선택 필드는 비어 있을 수 있다. */
export type TourApiItem = {
  contentid?: string;
  contenttypeid?: string;
  title?: string;
  addr1?: string;
  addr2?: string;
  mapx?: string;
  mapy?: string;
  firstimage?: string;
  firstimage2?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  lDongRegnCd?: string;
  lDongSignguCd?: string;
  dist?: string;
};

export type TourCandidatesResponse =
  | {
      ok: true;
      source: "tourapi";
      usedLocation: boolean;
      items: TourApiItem[];
    }
  | {
      ok: false;
      error: string;
      message?: string;
      items?: TourApiItem[];
    };
