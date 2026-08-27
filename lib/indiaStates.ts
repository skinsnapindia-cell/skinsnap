/** All Indian States and Union Territories, for the checkout state dropdown. */
export const INDIA_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/** India Post sometimes returns state names that differ from our canonical
 *  list; normalise the common mismatches so the dropdown selects correctly. */
export function normalizeState(raw: string): string {
  const s = raw.trim();
  const map: Record<string, string> = {
    Pondicherry: "Puducherry",
    "Orissa": "Odisha",
    "Uttaranchal": "Uttarakhand",
    "Delhi (NCT)": "Delhi",
    "NCT of Delhi": "Delhi",
    "Jammu & Kashmir": "Jammu and Kashmir",
    "Andaman & Nicobar Islands": "Andaman and Nicobar Islands",
    "Daman and Diu": "Dadra and Nagar Haveli and Daman and Diu",
    "Dadra and Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
  };
  if (map[s]) return map[s];
  // case-insensitive exact match against the canonical list
  const hit = INDIA_STATES.find((x) => x.toLowerCase() === s.toLowerCase());
  return hit || s;
}
