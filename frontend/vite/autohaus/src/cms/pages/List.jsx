import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from 'react-spinners';
import useStore from '../../store';
import authAxiosInstance from '../../utils/http';
import RenderField from '../components/RenderField';

const List = () => {
  const { entity } = useParams();
  const navigate = useNavigate();
  const { hasPermission, addToast } = useStore();
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [name, setName] = useState('');
  const [filterData, setFilterData] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [pageStart, setPageStart] = useState(1);
  const [pageEnd, setPageEnd] = useState(10);
  const [pageSize, setPageSize] = useState(20);

  const canRead = hasPermission(entity, 'read');
  const canWrite = hasPermission(entity, 'write');
  const canDelete = hasPermission(entity, 'delete');

  useEffect(() => {
    if (!canRead) {
      addToast('You do not have permission to view this content', 'error');
      navigate('/cms');
      return;
    }

    fetchData(page);
  }, [entity]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    setPage(pageNum);
    try {
      const response = await authAxiosInstance.get(
        `/api/cms/list/${entity}/?page=${pageNum}&filters=${encodeURIComponent(
          JSON.stringify(filterData)
        )}`
      );

      setData(response.data.data);
      setSchema(response.data.schema);
      setTotalCount(response.data.count);
      setTotalPages(response.data.page_count);
      setPageStart(response.data.page_start);
      setPageEnd(response.data.page_end);
      setPage(response.data.page);
      setPageSize(response.data.page_size);
      setName(response.data.name);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    setPage(1);
    fetchData(1);
  };

  const clearFilters = () => {
    setFilterData({});
    fetchData(page);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '992px' }}>
      <div className="w-full bg-white rounded shadow flex items-center py-2 px-8">
        <h3 className="flex-1 text-lg font-bold">{name} List</h3>
        {canWrite && (
          <button
            style={{backgroundColor: "#010038"}}
            onClick={() => navigate(`/cms/create/${entity}`)}
            className="hover:bg-cms-primary-hover py-1 px-2 text-white rounded"
          >
            <FontAwesomeIcon icon={faPlus} /> Create New
          </button>
        )}
      </div>

      <div className="flex gap-4 mt-4 ">
        {/* Filters Sidebar */}
        <div
          className="sm:w-56 bg-white p-4"
          style={{
            height:
              window.innerWidth > 600 || showFilters ? 'fit-content' : '52px',
          }}
        >
          <button
            className="font-bold uppercase text-sm text-cms-primary mb-2 sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          {schema.map((scheme) => (
            <RenderField
              key={scheme.fieldname}
              {...scheme}
              handler={(fieldname, val) => {
                setFilterData({ ...filterData, [fieldname]: val });
              }}
            />
          ))}
          <button
            onClick={filterResults}
            className="w-full py-2 mt-4 bg-blue-400 hover:bg-cms-primary-hover rounded text-white"
          >
            <FontAwesomeIcon icon={faFilter} /> FILTER
          </button>
          <button
            onClick={clearFilters}
            className="w-full py-2 mt-4 bg-red-600 rounded text-white"
          >
            <FontAwesomeIcon icon={faTimes} /> CLEAR
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded min-h-128 flex flex-col justify-between">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <ClipLoader color="#48B5FF" size={50} />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg font-medium">No Items Found</p>
              <p className="text-gray-500 text-sm mt-2">
                There are no {name.toLowerCase()} to display
              </p>
              {canWrite && (
                <button
                  style={{backgroundColor: "#010038"}}
                  onClick={() => navigate(`/cms/create/${entity}`)}
                  className="mt-4 py-2 px-4 text-white rounded hover:bg-cms-primary-hover"
                >
                  <FontAwesomeIcon icon={faPlus} /> Create Your First {name}
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="text-white" style={{backgroundColor: "#010038"}}>
                    {schema.map((f, i) => (
                      <th
                        key={f.fieldname}
                        className={[
                          i === 0 ? 'w-48' : null,
                          'p-2 text-left',
                        ].join(' ')}
                      >
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, j) => (
                    <tr key={row.id}>
                      {schema.map((f, k) => (
                        <td
                          key={f.fieldname}
                          className={[
                            'py-1 px-2',
                            j % 2 === 0 ? 'bg-cms-primary-light' : null,
                            k === 0 ? 'font-bold' : null,
                          ].join(' ')}
                        >
                          {k === 0 ? (
                            <Link to={`/cms/update/${entity}/${row.id}`}>
                              {row[f.fieldname]}
                            </Link>
                          ) : (
                            row[f.fieldname]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{pageStart}</span> to{' '}
                      <span className="font-medium">{pageEnd}</span> of{' '}
                      <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchData(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchData(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;
