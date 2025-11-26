import React from 'react';
import Table from './Table';
import SearchInput from './SearchInput';
import PhotoGridWidget from './PhotoGridWidget';
import PhotoWidget from './PhotoWidget';

const RenderField = ({
  field,
  value,
  onChange,
  error,
  disabled,
  // Support both naming conventions from scaffold
  fieldtype,
  fieldname,
  label,
  options,
  required,
  hidden,
  hideLabel,
  handler,
  data
}) => {
  // Support both field object and individual props
  const type = fieldtype || field?.type || field?.fieldtype;
  const name = fieldname || field?.name || field?.fieldname;
  const fieldLabel = label || field?.label;
  const fieldOptions = options || field?.options || field?.choices;
  const isRequired = required !== undefined ? required : field?.required;
  const isHidden = hidden !== undefined ? hidden : field?.hidden;
  const isDisabled = disabled !== undefined ? disabled : field?.disabled;

  const handleChange = (e) => {
    const newValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    // Support both onChange and handler from scaffold
    if (onChange) {
      onChange(name, newValue);
    } else if (handler) {
      handler(name, newValue);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onChange) {
          onChange(name, reader.result);
        } else if (handler) {
          handler(name, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderInput = () => {
    const usedOptions = fieldOptions;

    switch (type) {
      case 'text':
      case 'string':
      case 'char':
        return (
          <input
            type="text"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
            maxLength={field?.max_length}
          />
        );

      case 'password':
        return (
          <input
            type="password"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          />
        );

      case 'integer':
      case 'number':
      case 'decimal':
        return (
          <input
            type="number"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
            step={type === 'decimal' ? '0.01' : '1'}
          />
        );

      case 'bool':
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={handleChange}
            disabled={isDisabled}
          />
        );

      case 'textarea':
      case 'text':
        return (
          <textarea
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
            rows={field?.rows || 4}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          />
        );

      case 'image':
      case 'photo':
        return (
          <PhotoWidget
            handler={(fileUrl) => {
              const handleChange = onChange || handler;
              if (handleChange) {
                handleChange(name, fileUrl);
              }
            }}
            value={value}
            multiple={false}
          />
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              className="w-full"
              onChange={handleFileChange}
              disabled={isDisabled}
            />
            {value && typeof value === 'string' && value.startsWith('http') && (
              <img
                src={value}
                alt="Preview"
                style={{ marginTop: '10px', maxWidth: '200px', maxHeight: '200px' }}
              />
            )}
          </div>
        );

      case 'foreignkey':
      case 'search':
        return (
          <SearchInput
            model={fieldOptions}
            onChange={onChange || handler}
            fieldname={name}
            value={value}
          />
        );

      case 'select':
      case 'choice':
        return (
          <select
            className="w-full"
            value={value || ''}
            onChange={handleChange}
            disabled={isDisabled}
            required={isRequired}
          >
            <option value="">---</option>
            {usedOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'table':
        return (
          <Table
            data={value}
            fields={fieldOptions}
            onChange={onChange || handler}
            fieldname={name}
          />
        );

      case 'component':
        // Support component-based widgets like PhotoGridWidget
        if (fieldOptions === 'PhotoGridWidget') {
          return (
            <PhotoGridWidget
              initial={data && data[':vehiclephoto'] && data[':vehiclephoto'].map(img => ({
                url: img.photo,
                path: img.photo // Keep path same as url for existing photos
              }))}
              handler={(photos) => {
                const handleChange = onChange || handler;
                if (handleChange) {
                  handleChange(':vehiclephoto', photos.map(img => ({
                    photo: img.path || img.url, // Support both new uploads (path) and existing (url)
                    width: img.width || 128,
                    height: img.height || 128
                  })));
                }
              }}
            />
          );
        }
        return <output>Unsupported component: {fieldOptions}</output>;

      default:
        return (
          <output>{value}</output>
        );
    }
  };

  if (isHidden) {
    return null;
  }

  // For table fields, use special layout without border wrapper
  if (type === 'table') {
    return (
      <div className="field-container mt-4">
        {!hideLabel && (
          <label className="block mb-2 font-semibold" style={{ color: '#48B5FF' }}>{fieldLabel}</label>
        )}
        <div className="p-2">
          {renderInput()}
        </div>
      </div>
    );
  }


  return (
    <div className="field-container mt-4">
      {!hideLabel && (
        <label className="block mb-2 font-semibold" style={{ color: '#48B5FF' }}>
          {fieldLabel}
          {isRequired && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      {field?.help_text && (
        <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>
          {field.help_text}
        </div>
      )}
      <div className={[
        'bg-white p-2 rounded-sm shadow-sm',
        isRequired ? 'border-1 border-cms-primary' : 'border-1 border-gray-300'
      ].join(' ')}>
        {renderInput()}
      </div>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default RenderField;
