module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {},
      fontFamily: {},
      spacing: {},
      typography: () => {
        return {
          DEFAULT: {
            css: {
              code: {
                '&::before, &::after': {
                  display: 'none',
                },
                'font-family': 'Inter, ui-monospace, SFMono-Regular, Menlo, monospace',
              },
              'li, a': {
                color: 'rgba(7, 9, 76, 0.7)',
              },
              'li, li code': {
                'font-size': '16px',
              },
              p: {
                color: 'rgba(7, 9, 76, 0.7)',
                'line-height': '30px',
                'font-size': '18px',
              },
              'p code': {
                'font-size': '18px',
              },
              h1: {
                'line-height': '64px',
                'letter-spacing': 0,
                'font-weight': '700',
              },
              'h1,h2,h3,h4,h5,h6': {
                'font-family': 'Wix Madefor Display',
              },
              'strong,code': {
                color: 'rgba(7, 9, 76)',
              },

              th: {
                'font-weight': '500',
              },
              'td a': {
                'font-weight': '400',
              },
            },
          },
        };
      },
    },
  },
  plugins: [],
};
