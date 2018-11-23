module.exports = function(api) {
  console.log('Loading the root babel config...');
  api.cache.forever(); // No variable part in the config, we don't need to cache.
  return {
    presets: [
      ['@babel/preset-react'],
      [
        '@babel/preset-env',
        {
          targets: {
            node: '0.12',
            browsers: 'last 2 versions, > 5%'
          }
        }
      ]
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
      'emotion'
    ]
  };
};
