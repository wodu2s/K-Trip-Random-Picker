import { supabase } from "./supabase";
import type { Destination } from "../types/travel";
import type { SavedPlace } from "../types/community";

type SavedPlaceRow = {
  id: string;
  destination_id: string;
  destination_name: string;
  region: string;
  image: string | null;
  short_description: string | null;
  created_at: string;
};

function requireClient() {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  return supabase;
}

/**
 * 내가 저장한 장소 목록 (최신순).
 * RLS 가 auth.uid() = user_id 인 행만 돌려주므로 남의 목록은 조회되지 않는다.
 */
export async function fetchSavedPlaces(): Promise<SavedPlace[]> {
  const client = requireClient();

  const { data, error } = await client
    .from("saved_places")
    .select("id, destination_id, destination_name, region, image, short_description, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as SavedPlaceRow[]).map((row) => ({
    id: row.id,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    region: row.region,
    image: row.image,
    shortDescription: row.short_description,
    createdAt: row.created_at,
  }));
}

/** 이 여행지가 이미 저장되어 있는지 (하트/버튼 상태 표시용) */
export async function isPlaceSaved(userId: string, destinationId: string): Promise<boolean> {
  const client = requireClient();
  const { data, error } = await client
    .from("saved_places")
    .select("id")
    .eq("user_id", userId)
    .eq("destination_id", destinationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

/**
 * 장소 저장. TourAPI 여행지는 새로고침 후 다시 조회되지 않을 수 있어
 * 목록 표시에 필요한 정보를 함께 넣는다.
 */
export async function addSavedPlace(userId: string, destination: Destination): Promise<void> {
  const client = requireClient();

  const { error } = await client.from("saved_places").insert({
    user_id: userId,
    destination_id: destination.id,
    destination_name: destination.name,
    region: destination.region,
    image: destination.image || null,
    short_description: destination.shortDescription || null,
  });

  // 23505 = unique_violation. 이미 저장된 상태이므로 성공으로 본다.
  if (error && error.code !== "23505") throw new Error(error.message);
}

/** 저장 해제 */
export async function removeSavedPlace(userId: string, destinationId: string): Promise<void> {
  const client = requireClient();

  const { error } = await client
    .from("saved_places")
    .delete()
    .eq("user_id", userId)
    .eq("destination_id", destinationId);

  if (error) throw new Error(error.message);
}
