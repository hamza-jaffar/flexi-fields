import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/logo.jpg" 
            alt="Flexi Fields Logo" 
            {...props} 
            style={{ objectFit: 'contain', ...props.style }} 
        />
    );
}
