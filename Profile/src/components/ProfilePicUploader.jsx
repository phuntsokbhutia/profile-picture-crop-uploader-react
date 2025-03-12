// src/components/ProfilePicUploader.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePicUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 / 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
  });

  const onImageLoad = useCallback((img) => {
    setImageRef(img);
  }, []);

  const makeClientCrop = async () => {
    if (imageRef && crop.width && crop.height) {
      console.log('Crop values:', crop);
      try {
        const croppedImage = await getCroppedImg(imageRef, crop);
        setCroppedImageUrl(croppedImage);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    } else {
      console.error('Cannot crop: imageRef or crop values are invalid');
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: (crop.x * image.width) / 100,
      y: (crop.y * image.height) / 100,
      width: (crop.width * image.width) / 100,
      height: (crop.height * image.height) / 100,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    console.log('Drawing on canvas with:', {
      sourceX: pixelCrop.x * scaleX,
      sourceY: pixelCrop.y * scaleY,
      sourceWidth: pixelCrop.width * scaleX,
      sourceHeight: pixelCrop.height * scaleY,
      destWidth: pixelCrop.width,
      destHeight: pixelCrop.height,
    });

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        1
      );
    });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', textAlign: 'center' }}>
      {!imageSrc && (
        <div style={{ padding: '20px' }}>
          <button
            {...getRootProps()}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '50px',
            }}
          >
            <input {...getInputProps()} />
            <span role="img" aria-label="upload image">
              📷
            </span>
          </button>
          <p style={{ marginTop: '10px' }}>Click the image icon to upload a profile picture</p>
        </div>
      )}

      {imageSrc && !croppedImageUrl && (
        <>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={1 / 1}
          >
            <img src={imageSrc} onLoad={(e) => onImageLoad(e.target)} alt="Crop preview" />
          </ReactCrop>
          <button
            onClick={makeClientCrop}
            style={{ marginTop: '10px' }}
          >
            Crop Image
          </button>
        </>
      )}

      {croppedImageUrl && (
        <>
          <h3>Cropped Profile Picture</h3>
          <img
            src={croppedImageUrl}
            alt="Cropped result"
            style={{ maxWidth: '100%', borderRadius: '50%' }}
          />
          <button
            onClick={() => {
              setImageSrc(null);
              setCroppedImageUrl(null);
            }}
            style={{ marginTop: '10px' }}
          >
            Upload Another
          </button>
        </>
      )}
    </div>
  );
};

export default ProfilePicUploader;


