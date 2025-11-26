import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { url } from "../../constants";
import axios from "../../utils/http";
import { MoonLoader } from 'react-spinners';

const PhotoWidget = ({handler, value, multiple}) => {
    const [id, setId] = React.useState("");
    const [uploading, setUploading] = useState(false);

    const valid_file_types = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'ico', 'bmp', 'webp'];
    React.useEffect(() => {
        setId(Math.random().toString(36).slice(2));
    }, []);

    const deleteFile = () => {
        axios.post('/api/cms/photo-delete/', {image_name: value})
            .then(res => {
                if(handler) {
                    handler(null);
                }
            });
    };

    const uploadFile = (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        axios.post('/api/cms/photo-upload/cmsimage/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            if (response.data.file_url) {
                if (handler) {
                    handler(response.data.file_url);
                }
            } else {
                console.error('File upload failed:', response.data.error);
            }
            setUploading(false);
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            setUploading(false);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files[0];
        uploadFile(files);
    };

    const handleFileSelect = (e) => {
        const files = e.target.files[0];
        uploadFile(files);
    };

    if(uploading) {
        return <div className="border-2 border-cms-primary rounded-lg p-4 flex flex-col items-center justify-center">
                <MoonLoader
                    ariaLabel="loading-indicator"
                    color="#48B5FF"
                    size={80}
                />
        </div>;
    }

    return (
        <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                multiple={false}
                className="hidden"
                id={id}
                onChange={handleFileSelect}
            />
            <label
                htmlFor={id}
                className="cursor-pointer text-center !text-gray-500 hover:text-gray-700"
            >
                Drag & Drop a photo here or <span className="text-cms-primary font-bold">browse</span>
            </label>
            <div className="mt-4 relative group">
                {value && (
                    <div className="relative group">
                        <img
                            src={`${url}${value}`}
                            alt="Preview"
                            className="w-full h-36 object-cover rounded-md shadow-md"
                        />
                        <button
                            onClick={deleteFile}
                            style={{top: "-16px", right: "-16px"}}
                            className="absolute bg-red-500 text-white w-8 h-8 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>)
                }
            </div>
        </div>
    );
};

export default PhotoWidget;
