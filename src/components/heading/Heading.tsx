import React from 'react';
import './Heading.css';

export interface HeadingProps {
    headingText: string;
    small?: boolean;
};

const Heading: React.FC<HeadingProps> = ({ headingText, small = false }) => {
    return <span className={`heading ${small ? 'heading--small' : ''}`}>
        {headingText}
    </span>; 
};

export default Heading;