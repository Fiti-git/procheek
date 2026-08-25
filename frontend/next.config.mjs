import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  async redirects() {
    return [
      { source: '/cursos', destination: '/courses', permanent: true },
      { source: '/cursos/:slug', destination: '/courses/:slug', permanent: true },
      { source: '/consultoria', destination: '/consulting', permanent: true },
      { source: '/ayuda', destination: '/help', permanent: true },
      { source: '/privacidad', destination: '/privacy', permanent: true },
      { source: '/terminos', destination: '/terms', permanent: true },
    ];
  },
});
