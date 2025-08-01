export async function lookupPostcode(postcode: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      return { latitude: json.result.latitude, longitude: json.result.longitude };
    }
    return null;
  } catch {
    return null;
  }
}
