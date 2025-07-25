// Q : Show sample number in input box based on country code selection

import { useState, type ChangeEvent } from "react";

interface CountryOption {
  country_code: string;
  calling_code: string;
  country_name: string;
  sample: string;
  format: string;
}

interface PhoneBookProps {
  options: CountryOption[];
}

export default function PhoneBook({ options }: PhoneBookProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [numberSample, setNumberSample] = useState<string>("");

  const handleCountryCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    setSelectedCountryCode(selectedCode);

    const selectedData = options.find((opt) => opt.country_code === selectedCode);
    if (selectedData) {
      setNumberSample(selectedData.sample);
    }
  };

  return (
    <>
      <select
        value={selectedCountryCode}
        onChange={handleCountryCodeChange}
        name="countryCode"
        id="countryCodeSelect"
      >
        <option value="" disabled>
          Select Country Code
        </option>
        {options.map((data) => (
          <option key={data.country_code} value={data.country_code}>
            {data.country_code}
          </option>
        ))}
      </select>

      <input type="text" placeholder={numberSample} />
    </>
  );
}
