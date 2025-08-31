import type { User, Camera } from "@/types/api";

/**
 * Constructs the streaming URL for a camera using the user's public subdomain and camera ID.
 * Falls back to camera.httpUrl if subdomain or camera ID is missing.
 * 
 * @param user - The user profile containing subdomain info
 * @param camera - The camera object containing camera ID
 * @returns The constructed streaming URL string
 */
export function getCameraStreamUrl(user: User | null, camera: Camera): string {
  if (user?.subdomain?.subdomain && camera._id) {
    // Construct URL as publicurl/stream/camId
    const publicUrl = `https://${user.subdomain.subdomain}`;
    return `${publicUrl}/stream/${camera._id}`;
  }

  // Fallback to existing httpUrl or empty string
  return camera.httpUrl ?? "";
}
