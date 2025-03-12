import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ProfilePicUploader = ({ onImageUpload }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 / 1 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropModal(true); // Show the crop modal when an image is uploaded
    };
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
      try {
        const croppedImage = await getCroppedImg(imageRef, crop);
        setCroppedImageUrl(croppedImage); // Set the cropped image URL to show preview
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

  const handleSave = () => {
    if (croppedImageUrl && onImageUpload) {
      onImageUpload(croppedImageUrl); // Pass the cropped image to the parent
      setShowCropModal(false); // Close the modal after saving
    }
  };

  const handleCloseModal = () => {
    setShowCropModal(false);
    setImageSrc(null);
    setCroppedImageUrl(null); // Reset everything on cancel
  };

  return (
    <div>
      {!imageSrc && !croppedImageUrl && (
        <button {...getRootProps()} className="edit-button">
          <input {...getInputProps()} />
          Upload Profile Picture
        </button>
      )}

      {croppedImageUrl && !showCropModal && (
        <button
          onClick={() => {
            setImageSrc(null);
            setCroppedImageUrl(null);
          }}
          className="edit-button"
          style={{ marginTop: '10px' }}
        >
          Upload Another
        </button>
      )}

      {showCropModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '300px',
              maxWidth: '600px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!croppedImageUrl ? (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  aspect={1 / 1}
                >
                  <img src={imageSrc} onLoad={(e) => onImageLoad(e.target)} alt="Crop preview" />
                </ReactCrop>
                <button onClick={makeClientCrop} className="edit-button" style={{ marginTop: '10px' }}>
                  Crop Image
                </button>
                <button
                  onClick={handleCloseModal}
                  className="edit-button"
                  style={{ marginTop: '10px', marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>Preview</h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <img
                    src={croppedImageUrl}
                    alt="Cropped preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <button onClick={handleSave} className="edit-button" style={{ marginRight: '10px' }}>
                  Save
                </button>
                <button
                  onClick={() => setCroppedImageUrl(null)} // Go back to cropping
                  className="edit-button"
                  style={{ marginRight: '10px' }}
                >
                  Recrop
                </button>
                <button onClick={handleCloseModal} className="edit-button">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicUploader;


