import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "../../utils/http";
import { MoonLoader } from "react-spinners";
import { url } from "../../constants";

const PhotoGridWidget = ({initial, handler}) => {
    const [photos, setPhotos] = useState(initial || []);
    const [uploading, setUploading] = useState(false);

    const uploadFile = (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        axios
            .post("/api/cms/photo-upload/vehiclephoto/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                if (response.data.file_path) {
                    const newPhoto = {
                        url: response.data.file_url,
                        path: response.data.file_path,
                    };
                    setPhotos((prev) => {
                        const updatedPhotos = [...prev, newPhoto];
                        if(handler)
                            handler(updatedPhotos);
                        return updatedPhotos;
                    });
                } else {
                    console.error("File upload failed:", response.data.error);
                }
                setUploading(false);
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
                setUploading(false);
            });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        files.forEach(uploadFile);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(uploadFile);
    };

    const deletePhoto = (index) => {
        const photoToDelete = photos[index];
        axios
            .post("/api/cms/photo-delete/", { image_name: photoToDelete.path })
            .then(() => {
                const updatedPhotos = photos.filter((_, i) => i !== index);
                setPhotos(updatedPhotos);
                if(handler)
                    handler(updatedPhotos);
            })
            .catch((error) => {
                console.error("Error deleting photo:", error);
            });
    };

    if (uploading) {
        return (
            <div className="border-2 border-cms-primary rounded-lg p-4 flex flex-col items-center justify-center">
                <MoonLoader ariaLabel="loading-indicator" color="#48B5FF" size={80} />
            </div>
        );
    }

    return (
        <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="photo-upload"
                onChange={handleFileSelect}
            />
            <label
                htmlFor="photo-upload"
                className="cursor-pointer text-center !text-gray-500 hover:text-gray-700"
            >
                Drag & Drop photos here or <span className="text-cms-primary font-bold">browse</span>
            </label>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={`${url}${photo.url}`}
                            alt="Preview"
                            className="w-full h-36 object-cover rounded-md shadow-md"
                        />
                        <button
                            onClick={() => deletePhoto(index)}
                            style={{ top: "-16px", right: "-16px" }}
                            className="absolute bg-red-500 text-white w-8 h-8 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGridWidget;
