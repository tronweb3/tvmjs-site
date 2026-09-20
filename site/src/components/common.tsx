'use client';
// MUI's `styled` is a client-only API, so this module marks the client boundary
// itself. Without it a server component importing Container/Title (the roadmap
// page) fails page-data collection at build time.
import React from 'react';
import { styled, Typography, Link } from '@mui/material';
import MuiButton from '@mui/material/Button';

export const Button = styled(MuiButton)({
  height: '50px',
  lineHeight: '50px',
  color: '#fff',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.5s ease',
  margin: '0',
  fontFamily: 'Wix Madefor Display',
  '&:hover': {
    backgroundColor: '#fff',
    color: '#000',
  },
  '&.Mui-disabled': {
    color: '#fff',
  },
});

export const Container = styled('div')(
  ({
    paddingTop = '100px',
    paddingBottom = '150px',
    background,
    height,
    minHeight,
  }: {
    paddingTop?: string;
    background?: string;
    height?: string;
    minHeight?: string;
    paddingBottom?: string;
  }) => ({
    height: height || 'unset',
    minHeight: minHeight || 'unset',
    boxSizing: 'border-box',
    margin: '0',
    paddingTop,
    paddingBottom,
    display: 'flex',
    flexDirection: 'column',
    background: background,
    '@media (max-width: 780px)': {
      paddingTop: '50px',
    },
  })
);

export const Title = styled('h1')<{ textAlign?: React.CSSProperties['textAlign'] }>(({ textAlign = 'center' }) => ({
  fontFamily: 'Wix Madefor Display, sans-serif',
  fontSize: '40px',
  fontWeight: 800,
  marginBottom: '10px',
  textAlign,
  color: 'rgba(7, 9, 76, 1)',
  '@media (max-width: 780px)': {
    fontSize: '24px',
  },
}));

export const SubTitle = styled(Typography)({
  maxWidth: '1200px',
  fontFamily: 'Wix Madefor Display, sans-serif',
  fontSize: '18px',
  fontWeight: 500,
  margin: '0 auto',
  marginBottom: '20px',
  textAlign: 'center',
  color: 'rgba(7, 9, 76, 1)',
  '@media (max-width: 780px)': {
    fontSize: '14px',
  },
});

export const A = styled(Link)({
  fontFamily: 'Wix Madefor Display, sans-serif',
  fontSize: '18px',
  fontWeight: 600,
  textDecoration: 'none',
  color: '#4643df',
  '@media (max-width: 780px)': {
    fontSize: '14px',
  },
});
