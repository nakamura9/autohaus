import React from 'react';
import { useState, useRef } from 'react';
import authAxiosInstance from '../../utils/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faInbox } from '@fortawesome/free-solid-svg-icons';

const SearchInput = ({ model, onChange, placeholder, fieldname, value }) => {
  const [options, setOptions] = useState([]);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setIsOptionsVisible(true);
    setSelectedOption(inputValue);
    setSearchQuery(inputValue);

    if (inputValue.length > 2) {
      setIsSearching(true);
      authAxiosInstance
        .get(`/api/cms/search-input/?model=${model}&q=${inputValue}`)
        .then((response) => {
          console.log(response.data);
          setOptions(response.data);
          setIsSearching(false);
        })
        .catch((error) => {
          console.error('Error fetching results:', error);
          setIsSearching(false);
        });
    } else {
      setOptions([]);
      setIsSearching(false);
    }
  };

  const selectOption = (option, id) => {
    setSelectedOption(option);
    setIsOptionsVisible(false);
    onChange(fieldname, id);
  };

  const handleCreateNew = () => {
    // Convert model name to lowercase for URL
    const entityName = model.toLowerCase();
    window.open(`/cms/create/${entityName}`, '_blank');
  };

  const handleBlur = (e) => {
    // Check if the related target (where focus is moving to) is within the dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      // Focus moved to the dropdown, don't close it
      return;
    }
    // Focus moved outside, close dropdown and validate
    setIsOptionsVisible(false);
    if (selectedOption && !options.find((opt) => opt.name === selectedOption)) {
      setSelectedOption(null);
      onChange(null);
    }
  };

  React.useEffect(() => {
    if (value && !(selectedOption && selectedOption.length > 0)) {
      authAxiosInstance
        .get(`/api/cms/search-input/?model=${model}&id=${value}`)
        .then((response) => {
          setOptions(response.data);
          if (response.data.length > 0) {
            setSelectedOption(response.data[0].name);
          }
        })
        .catch((error) => {
          console.error('Error fetching results:', error);
        });
    }
  }, [value]);

  React.useEffect(() => {
    authAxiosInstance
      .get(`/api/cms/search-input/?model=${model}`)
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching results:', error);
      });
  }, [model]);

  return (
    <div className="relative">
      <input
        value={selectedOption ?? ''}
        onChange={handleInputChange}
        type="text"
        placeholder={placeholder}
        className="focus:outline-none ml-2 w-full p-1 px-2"
        onBlur={handleBlur}
        onFocus={() => {
          console.log('focused');
          setIsOptionsVisible(true);
        }}
      />

      {/* Dropdown */}
      {isOptionsVisible && (
        <div
          ref={dropdownRef}
          tabIndex={-1}
          className="max-h-72 overflow-y-auto absolute bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-full z-10"
        >
          {/* Create New Button */}
          <div
            className="sticky top-0 bg-cms-primary hover:bg-cms-primary-hover text-white px-4 py-3 cursor-pointer transition-colors duration-200 flex items-center gap-2 font-medium border-b border-cms-primary-hover"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent input blur
              handleCreateNew();
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create New {model}</span>
          </div>

          {/* Options List */}
          {isSearching ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-2xl mb-2 animate-pulse"
              />
              <p className="text-sm">Searching...</p>
            </div>
          ) : options.length > 0 ? (
            <ul>
              {options.map((option, index) => (
                <li
                  className="hover:bg-cms-primary-light px-4 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    selectOption(option.name, option.id);
                  }}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          ) : searchQuery.length > 2 ? (
            <div className="px-4 py-8 text-center">
              <FontAwesomeIcon icon={faInbox} className="text-gray-300 text-3xl mb-3" />
              <p className="text-gray-600 font-medium mb-1">No items found</p>
              <p className="text-gray-500 text-sm">
                Try a different search term or create a new item
              </p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <FontAwesomeIcon icon={faSearch} className="text-gray-300 text-3xl mb-3" />
              <p className="text-gray-600 font-medium mb-1">Start typing to search</p>
              <p className="text-gray-500 text-sm">Enter at least 3 characters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
