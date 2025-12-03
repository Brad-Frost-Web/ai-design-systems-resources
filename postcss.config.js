module.exports = {
  plugins: [
    require('postcss-import')({
      resolve: (id, basedir, importOptions) => {
        // Handle special case for tokens.css (Sass converts the full path to just 'tokens.css')
        if (id === 'tokens.css') {
          return require.resolve('@brad-frost-web/eddie-design-tokens/bfw/build/css/tokens.css');
        }
        // If it starts with @, it's a node_modules import - try to resolve it
        if (id.startsWith('@') || (!id.startsWith('.') && !id.startsWith('/'))) {
          try {
            return require.resolve(id);
          } catch (e) {
            // If resolution fails, let postcss-import handle it with default logic
            return id;
          }
        }
        // Otherwise use default resolution
        return id;
      },
    }),
  ],
};
