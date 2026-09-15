module.exports = {
  forbidden: [
    {
      name: 'domain-must-remain-independent',
      severity: 'error',
      from: { path: '^src/domain(?:/|$)' },
      to: {
        path: '^(?:src/(?:application|infrastructure|presentation)(?:/|$)|@angular/|@ionic/|@capacitor/)',
      },
    },
    {
      name: 'application-must-not-depend-on-infrastructure-or-frameworks',
      severity: 'error',
      from: { path: '^src/application(?:/|$)' },
      to: {
        path: '^(?:src/infrastructure(?:/|$)|@angular/|@ionic/|@capacitor/)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
  },
};
