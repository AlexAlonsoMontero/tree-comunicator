/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure-typescript',
      severity: 'error',
      comment:
        'Domain contains entities, rules, and policies only; it must stay independent of frameworks and other layers.',
      from: { path: '^src/app/domain' },
      to: {
        path: [
          '^src/app/application',
          '^src/app/infrastructure',
          '^src/app/presentation',
          '@angular',
          '@ionic',
          '@capacitor',
        ],
      },
    },
    {
      name: 'application-stays-framework-and-adapter-free',
      severity: 'error',
      comment:
        'Application coordinates use cases and ports; framework and adapter details belong outside it.',
      from: { path: '^src/app/application' },
      to: {
        path: [
          '^src/app/infrastructure',
          '^src/app/presentation',
          '@angular',
          '@ionic',
          '@capacitor',
        ],
      },
    },
    {
      name: 'infrastructure-does-not-import-presentation',
      severity: 'error',
      comment: 'Infrastructure adapts external systems and must not depend on Ionic Angular views.',
      from: { path: '^src/app/infrastructure' },
      to: { path: '^src/app/presentation' },
    },
    {
      name: 'presentation-is-not-imported-by-inner-or-adapter-layers',
      severity: 'error',
      comment:
        'Presentation is the outer UI layer; domain, application, and infrastructure must not import it.',
      from: { path: '^src/app/(domain|application|infrastructure)' },
      to: { path: '^src/app/presentation' },
    },
  ],
  options: {
    doNotFollow: {
      path: '^node_modules',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['types', 'import', 'require', 'node', 'default'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
