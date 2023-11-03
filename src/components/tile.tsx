import React from 'react';
import styled from '@emotion/styled';

type StyleProps = {
  active?: boolean;
};

type TileProps = {
  image: string;
  title: string;
  active?: boolean;
};

const Outer = styled.div(({ active }: StyleProps) => ({
  boxSizing: 'border-box',
  width: '100%',
  borderRadius: 'var(--scale-8)',
  overflow: 'hidden',
  display: 'flex',
  border: '4px solid rgb(0 0 0 / 10%)',
  ...(active && {
    border: '4px solid yellow'
  }), 
}));


const ImageEl = styled.img`
  width: 100%;
  height: auto;
`;

const Tile: React.FC<TileProps> = ({ title, image, active }) => {
  return <Outer active={active}><ImageEl src={image} alt={title} /></Outer>;
};

export default Tile;