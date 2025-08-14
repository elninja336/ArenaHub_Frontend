import React from "react";

const countries = [
  { code: "TZ", name: "Tanzania", prefix: "+255", flag: "🇹🇿" },
  { code: "KE", name: "Kenya", prefix: "+254", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", prefix: "+256", flag: "🇺🇬" },
  { code: "RW", name: "Rwanda", prefix: "+250", flag: "🇷🇼" },
  // Add more as needed
];

export default function CountrySelect({ value, onChange }) {
  return (
    <select
      className="form-select me-2"
      value={value}
      onChange={onChange}
      style={{ maxWidth: "120px" }}
      aria-label="Select country code"
    >
      {countries.map((c) => (
        <option key={c.code} value={c.prefix}>
          {c.flag} {c.prefix}
        </option>
      ))}
    </select>
  );
}
