// Q : Show sample number in input box based on country code selection
import { useEffect, useState, type ChangeEvent } from "react";

interface countryOptions {
  country_code: string;
  calling_code: string;
  country_name: string;
  sample: string;
  format: string;
}

interface phoneBookProps {
  options: countryOptions[];
}

export default function PhoneBook({ options }: phoneBookProps) {
  const [countryCode, setCountryCode] = useState<string>("");
  const [placeholderSample, setPlaceHolderSample] = useState<string>("");

  useEffect(() => {
    if (options.length > 0) {
      const defaultCountry = options[0];
      setCountryCode(defaultCountry.country_code);
      setPlaceHolderSample(defaultCountry.sample);
    }
  }, [options]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCountryCode(code);

    const getSample = options.find((option) => option.country_code === code);
    setPlaceHolderSample(getSample?.sample || "");
  };

  return (
    <>
      <select name="phoneBook" id="countryCode" value={countryCode} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.country_code} value={option.country_code}>
            {option.country_code}
          </option>
        ))}
      </select>

      <input type="text" placeholder={placeholderSample} />
    </>
  );
}
