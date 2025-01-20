import React, { useState, useRef, useContext } from 'react';
import styles from '../styles/components.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCar } from '@fortawesome/free-solid-svg-icons';
import Context from '../provider';


const ImageUploadWidget = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const dropRef = useRef(null);
  const cameraInputRef = useRef(null);
  const context = useContext(Context);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        // Call the callback function with the file
        onUploadSuccess({file: file, src: e.target.result});
      };
      reader.readAsDataURL(file);

    } else {
      context.toast('Please upload an image file');
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraInput = (e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  return (
    <div className={styles.uploadContainer}>
        <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={styles.imageUploadWidget}
      style={{
        border: `2px dashed ${isDragging ? '#2196f3' : '#F58533'}`,
        background: isDragging ? 'rgba(33, 150, 243, 0.1)' : 'transparent'
      }}
    >
      <input
        type="file"
        onChange={handleFileInput}
        accept="image/*"
        className={styles.imageUploadInput}
        id="fileInput"
      />
      <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
        {preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              className={styles.imgPreview}
            />
            <p>Drop a new image or click to change</p>
          </div>
        ) : (
          <div>
            <p>Drag and drop<br /> or <br />click to select</p>
            <FontAwesomeIcon icon={faCar} size="3x" color="#F58533" />
            
          </div>
        )}
      </label>
    </div>
    <button
    onClick={handleCameraCapture}
    className={styles.dragContainer}
  >
    <span>
    <FontAwesomeIcon icon={faCamera} />
    Take Photo
    </span>
  </button>
    </div>
  );
};

export default ImageUploadWidget;
