import React from 'react';

const PLACEHOLDER_IMAGE = '/images/image-placeholder.svg';

export const ImageWithFallback = ({ src, alt, ...props }) => (
  <img
    src={src || PLACEHOLDER_IMAGE}
    alt={alt}
    onError={(event) => {
      if (!event.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) {
        event.currentTarget.src = PLACEHOLDER_IMAGE;
      }
    }}
    {...props}
  />
);

export default ImageWithFallback;
