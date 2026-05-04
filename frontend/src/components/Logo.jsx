function Logo({ width = 35, height = 35 }) {
  return (
    <img 
      src="/logo.png" 
      alt="PlaceNix Logo" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        objectFit: 'contain',
        borderRadius: '50%' /* Just in case the image has a background that looks better rounded */
      }} 
    />
  );
}

export default Logo;
