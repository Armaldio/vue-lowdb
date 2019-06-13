module.exports = {
  root         : true,
  parser       : 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends      : ['airbnb-base'],
  // add your custom rules here
  'rules'      : {
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger'           : process.env.NODE_ENV === 'production' ? 2 : 0,
  },
  globals      : {
    performance: true,
    window: true,
  },
};
