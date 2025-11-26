import React from 'react';
import RenderField from './RenderField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

const RenderTableField = ({ fieldtype, fieldname, disabled, value, handler, options, required }) => {
  let component = null;
  switch (fieldtype) {
    case 'char':
      component = (
        <input
          className="w-full"
          type="text"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
        />
      );
      break;
    case 'password':
      component = (
        <input
          type="password"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
        />
      );
      break;
    case 'number':
      component = (
        <input
          className="w-full"
          type="number"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
        />
      );
      break;
    case 'text':
      component = (
        <textarea
          className="w-full"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
          rows={4}
        ></textarea>
      );
      break;
    case 'select':
      component = (
        <select
          className="w-full"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
          rows={4}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'bool':
      component = (
        <input
          type="checkbox"
          checked={value}
          onChange={(evt) => handler(fieldname, evt.target.checked)}
        />
      );
      break;
    case 'date':
      component = (
        <input
          type="date"
          className="w-full"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
          rows={4}
        />
      );
      break;
    case 'time':
      component = (
        <input
          type="time"
          className="w-full"
          disabled={disabled}
          value={value}
          onChange={(evt) => handler(fieldname, evt.target.value)}
          rows={4}
        />
      );
      break;
    default:
      component = <output>{value}</output>;
      break;
  }
  return (
    <td className={['p-2 ', required ? 'border-1 border-cms-primary' : null].join(' ')}>
      <div className="rounded-sm shadow-sm bg-white p-2 flex justify-center min-h-full">
        {component}
      </div>
    </td>
  );
};

const Header = ({ schema }) => {
  return (
    <thead>
      <tr className="font-semibold" style={{ color: '#48B5FF' }}>
        <th></th>
        {schema.map((f) => (
          <th className="p-2 " key={f.label}>
            {' '}
            {f.label}{' '}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const Footer = ({ schema, handler }) => {
  return (
    <tfoot>
      <tr>
        <td colSpan={schema.length + 1}>
          <button
            onClick={handler}
            className=" py-1 px-2 font-semibold uppercase text-xs rounded-sm bg-cms-primary hover:bg-cms-primary-hover text-white"
          >
            Add Item
          </button>
        </td>
      </tr>
    </tfoot>
  );
};

const Row = ({ schema, data, onChange, index, removeRow }) => {
  const fieldChangeHandler = (fieldname, value) => {
    const newData = _.cloneDeep(data);
    newData[fieldname] = value;
    onChange(newData, index);
  };

  return (
    <tr>
      <td>
        <button
          onClick={() => removeRow(index)}
          className="text-red-600 py-1 px-2 uppercase text-sm font-bold rounded mr-2 hover:bg-red-500 hover:text-white"
        >
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </button>
      </td>

      {schema.map((field) => (
        <RenderTableField
          {...field}
          key={field.fieldname}
          value={data[field.fieldname]}
          handler={fieldChangeHandler}
        />
      ))}
    </tr>
  );
};

const Table = ({ fields, data, onChange, fieldname }) => {
  if (!fields) {
    return <div></div>;
  }

  const addRow = () => {
    if (!data) {
      onChange(fieldname, [{}]);
      return;
    }
    const newData = _.cloneDeep(data);
    newData.push({});
    onChange(fieldname, newData);
  };

  const removeRow = (index) => {
    const newData = _.cloneDeep(data);
    newData.splice(index, 1);
    onChange(fieldname, newData);
  };

  const rowChangeHandler = (newRow, index) => {
    const newData = _.cloneDeep(data);
    newData[index] = newRow;
    onChange(fieldname, newData);
  };

  return (
    <table>
      <Header schema={fields} />
      <tbody>
        {data &&
          data.map((row, index) => (
            <Row
              key={index}
              schema={fields}
              data={row}
              index={index}
              onChange={rowChangeHandler}
              removeRow={removeRow}
            />
          ))}
      </tbody>
      <Footer schema={fields} handler={addRow} />
    </table>
  );
};

export default Table;
