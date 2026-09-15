import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        'src/domain/**/*.ts': 95,
        'src/application/**/*.ts': 95,
        'src/{domain,application}/**/*{navigation,sms}*.ts': { 100: true },
      },
    },
  },
});
