module.exports = function (api) {
  // Cache invalida automaticamente quando NODE_ENV muda. Não podemos usar
  // api.cache(true) junto com api.env(...) — o Babel rejeita essa combinação
  // ("Caching has already been configured with .never or .forever()").
  api.cache.using(() => process.env.NODE_ENV);
  const isProd = process.env.NODE_ENV === 'production';
  return {
    presets: ['babel-preset-expo'],
    // Em build de produção remove TODAS as chamadas a console.* exceto console.error.
    // Mantém console.error para reporters de crash (Sentry, etc.) capturarem.
    plugins: isProd
      ? [['transform-remove-console', { exclude: ['error'] }]]
      : [],
  };
};
