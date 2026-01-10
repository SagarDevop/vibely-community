import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function CropModal({ image, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const imageObj = new Image();
      imageObj.crossOrigin = "anonymous";
      imageObj.onload = () => resolve(imageObj);
      imageObj.onerror = (err) => reject(err);
      imageObj.src = url;
    });

  const getCroppedImg = async () => {
    const img = await createImage(image);

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  const handleSave = async () => {
    const blob = await getCroppedImg();
    onSave(blob);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1F1F1F] p-4 rounded-xl w-[90%] max-w-lg shadow-xl border border-[#333]">
        <h2 className="text-white text-lg font-semibold mb-3">
          Adjust Your Image
        </h2>

        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
          className="w-full mt-4"
        />

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-black rounded-lg font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
