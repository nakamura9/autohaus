import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import useStore from '../../store';
import authAxiosInstance from '../../utils/http';
import { Section } from '../components/Grid';
import AuditTrail from '../components/AuditTrail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faTrash, faEdit, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

const Update = () => {
  const { entity, id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, addToast, setToast } = useStore();
  const [formData, setFormData] = useState({});
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const canRead = hasPermission(entity, 'read');
  const canWrite = hasPermission(entity, 'write');

  useEffect(() => {
    if (!canRead) {
      addToast('You do not have permission to view this content', 'error');
      navigate('/cms');
      return;
    }

    fetchData();
  }, [entity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get(`/api/cms/update/${entity}/${id}/`);

      if (response.data.success === false) {
        setLoading(false);
        setErrors([response.data.error || 'Failed to fetch entity data']);
        return;
      }

      setSections(response.data.sections);
      setName(response.data.data.title || response.data.name);
      setFormData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('Failed to load data', 'error');
      setLoading(false);
    }
  };

  const fieldHandler = (fieldname, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldname]: _.cloneDeep(value),
    }));
  };

  const validateMandatory = () => {
    const mandatory_fields = [];
    sections.forEach((s) => {
      s.forEach((col) => {
        col.forEach((f) => {
          if (f.required) {
            mandatory_fields.push(f);
          }
        });
      });
    });

    const errors = mandatory_fields
      .filter((f) => !formData[f.fieldname])
      .map((f) => `${f.label} is mandatory`);

    if (errors.length > 0) {
      setErrors(errors);
      return false;
    } else {
      setErrors([]);
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!canWrite) {
      addToast('You do not have permission to edit this content', 'error');
      return;
    }

    if (!validateMandatory()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAxiosInstance.post(`/api/cms/update/${entity}/${id}/`, formData);

      if (response.data.success) {
        setLoading(false);
        navigate(`/cms/list/${entity}`);
        setToast && setToast(`Successfully updated ${entity} ${name}`);
      }
    } catch (error) {
      setLoading(false);
      setErrors(['Failed to update entity']);
      setToast && setToast('Failed to update entity');
      console.error('Failed to update item:', error);
    }
  };

  const deleteEntity = () => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      authAxiosInstance.post(`/api/cms/delete/${entity}/${id}`).then((res) => {
        if (res.data.success) {
          navigate(-1);
        }
      });
    }
  };

  return (
    <div className="mx-auto px-4 py-6" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 flex items-center py-4 px-6 mb-6">
        <h3 className="flex-1 text-2xl font-semibold text-gray-800">Update {name}</h3>
        <div className="flex items-center gap-2">
          <Link
            className="px-3 py-2 text-cms-primary hover:bg-cms-primary-light rounded-md transition-colors duration-200 flex items-center gap-2 font-medium"
            to={`/cms/list/${entity}`}
          >
            <FontAwesomeIcon icon={faListUl} />
            <span className="hidden sm:inline">Back to List</span>
          </Link>
          <button
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center gap-2 font-medium"
            onClick={deleteEntity}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span className="hidden sm:inline">Delete</span>
          </button>
          {canWrite && (
            <button
              style={{backgroundColor: "#010038"}}
              className="px-4 py-2 hover:bg-cms-primary-hover text-white rounded-md transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
              onClick={handleSubmit}
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Update</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm mb-6 p-4">
          <div className="flex items-start">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-red-500 text-xl mt-0.5 mr-3"
            />
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold text-lg mb-2">
                Please fix the following errors:
              </h3>
              <ul className="space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-red-700 flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="w-full min-h-96 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 flex flex-col items-center">
            <BeatLoader color="#48B5FF" size={12} />
            <p className="text-gray-600 mt-4">Loading form...</p>
          </div>
        </div>
      )}

      {/* Form Sections */}
      {!loading && (
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <Section columns={s} eventHandler={fieldHandler} data={formData} />
            </div>
          ))}
        </div>
      )}

      {/* Audit Trail */}
      {!loading && (
        <div className="mt-6">
          <AuditTrail entity={entity} id={id} />
        </div>
      )}
    </div>
  );
};

export default Update;
