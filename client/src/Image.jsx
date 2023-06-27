export default function Image({src,...rest}) {
    const baseUrl = process.env.VITE_API_BASE_URL;
    src = src && src.includes('https://')
      ? src
      :`${baseUrl}/uploads/${src}`;
      

    console.log('src: ',src)
    return (
      <img {...rest} src={src} alt={''} />
    );
  }