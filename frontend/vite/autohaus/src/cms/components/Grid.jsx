import React from 'react';
import RenderField from './RenderField';

const Section = ({ columns, eventHandler, data }) => {
  return (
    <div className="flex gap-4 flex-col sm:flex-row">
      {columns.map((col, i) => (
        <Column key={i} fields={col} eventHandler={eventHandler} data={data} />
      ))}
    </div>
  );
};

const Column = ({ fields, eventHandler, data }) => {
  return (
    <div className="flex-1">
      {fields.map((f, i) => (
        <RenderField
          key={i}
          {...f}
          handler={eventHandler}
          value={data && data[f.fieldname]}
          data={data}
        />
      ))}
    </div>
  );
};

export { Section, Column };
