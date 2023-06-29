export default function Image({src,...rest}) {
  const domain = process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-domain.com/uploads/'
    : 'http://localhost:4000/uploads/';
  src = src && src.includes('https://')
      ? src
      :'http://localhost:4000/uploads/'+src;
    console.log('src: ',src)
    return (
      <img {...rest} src={src} alt={''} />
    );
  }