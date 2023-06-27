export default function Image({src,...rest}) {
    src = src && src.includes('https://')
      ? src
      : 'https://william-booking-app.vercel.app/'+src;

    console.log('src: ',src)
    return (
      <img {...rest} src={src} alt={''} />
    );
  }