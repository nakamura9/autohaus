import React from 'react'


const CountrySelect = ({ value, onChange }) => {
    const countries = [
      { code: 'ZW', name: 'Zimbabwe', prefix: '+263' },
      { code: 'ZA', name: 'South Africa', prefix: '+27' },
      { code: 'BW', name: 'Botswana', prefix: '+267' },
      { code: 'NA', name: 'Namibia', prefix: '+264' },
      { code: 'MZ', name: 'Mozambique', prefix: '+258' },
      { code: 'ZM', name: 'Zambia', prefix: '+260' },
      { code: 'AO', name: 'Angola', prefix: '+244' },
      { code: 'MW', name: 'Malawi', prefix: '+265' },
      { code: 'LS', name: 'Lesotho', prefix: '+266' },
      { code: 'SZ', name: 'Eswatini', prefix: '+268' }
    ];
  
    const getCountryFlag = (countryCode) => {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    };
  
    return (
      <select 
        value={value} 
        onChange={onChange}
        style={{ width: '80px', fontSize: '16px', border: "0px" }}
      >
        {countries.map(country => (
          <option 
            key={country.code} 
            value={country.prefix}
            style={{ fontSize: '16px' }}
          >
            {`${getCountryFlag(country.code)} ${country.prefix}`}
          </option>
        ))}
      </select>
    );
  };
  
export default CountrySelect;  