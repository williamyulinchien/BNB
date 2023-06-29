export default function Image({src,...rest}) {
    const domain = process.env.NODE_ENV === 'production' 
    ? 'https://bnb-theta.vercel.app/uploads/'
    : 'http://localhost:4000/uploads/';

    src = src && src.includes('https://')
    ? src
    : domain + src;

    console.log('src: ',src);
    return (
      <img {...rest} src={src} alt={''} />
    );
    }