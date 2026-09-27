#!/usr/bin/env node
import { execFile, spawn } from 'node:child_process';
import { basename } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const VALID_MODES = new Set(['targets', 'run']);

function printGeneralHelp() {
  console.log(`Uso:
  pnpm android:targets
  pnpm android:run -- [ANDROID_TARGET_ID]
  pnpm android:run -- --help

Lista dispositivos/emuladores con adb y despliega con Capacitor solo a un target explícito,
o automáticamente cuando hay exactamente un target online.`);
}

function printRunHelp() {
  console.log(`Uso:
  pnpm android:run -- [ANDROID_TARGET_ID]

Ejemplos:
  pnpm android:targets
  pnpm android:run -- emulator-5554
  pnpm android:run

Si no indicás ANDROID_TARGET_ID, el despliegue continúa solo cuando adb muestra exactamente
un dispositivo/emulador online. Con cero o múltiples targets online se cancela para evitar
instalar en el destino incorrecto.`);
}

function parseAdbDevices(output) {
  return output
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('List of devices attached'))
    .map((line) => {
      const [serial, state, ...details] = line.split(/\s+/u);
      const detailEntries = new Map(
        details
          .map((part) => part.split(':'))
          .filter((entry) => entry.length >= 2)
          .map(([key, ...valueParts]) => [key, valueParts.join(':')]),
      );

      return {
        serial,
        state: state ?? 'unknown',
        model: detailEntries.get('model'),
      };
    })
    .filter((target) => target.serial !== undefined && target.serial.length > 0);
}

async function readAndroidTargets() {
  try {
    const { stdout } = await execFileAsync('adb', ['devices', '-l'], {
      encoding: 'utf8',
      windowsHide: true,
    });

    return parseAdbDevices(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo ejecutar "adb devices -l". Verificá Android Platform Tools. Detalle: ${message}`,
    );
  }
}

function printTargets(targets) {
  if (targets.length === 0) {
    console.log('No se detectaron dispositivos o emuladores Android con adb.');
    return;
  }

  console.log('Targets Android detectados:');
  for (const target of targets) {
    const model = target.model === undefined ? 'modelo no informado' : target.model;
    console.log(`- id: ${target.serial} | estado: ${target.state} | modelo: ${model}`);
  }
}

function selectTargetForRun(targets, requestedSerial) {
  if (requestedSerial !== undefined) {
    const matchedTarget = targets.find((target) => target.serial === requestedSerial);
    if (matchedTarget === undefined) {
      throw new Error(
        `El target "${requestedSerial}" no aparece en adb. Ejecutá: pnpm android:targets`,
      );
    }

    if (matchedTarget.state !== 'device') {
      throw new Error(
        `El target "${requestedSerial}" está en estado "${matchedTarget.state}". Debe estar online (device).`,
      );
    }

    return matchedTarget.serial;
  }

  const onlineTargets = targets.filter((target) => target.state === 'device');
  if (onlineTargets.length === 1) {
    return onlineTargets[0].serial;
  }

  printTargets(targets);
  if (onlineTargets.length === 0) {
    throw new Error(
      'No hay ningún target Android online. Conectá uno o ejecutá un emulador y reintentá.',
    );
  }

  throw new Error(
    'Hay múltiples targets Android online. Elegí uno explícitamente: pnpm android:run -- <ANDROID_TARGET_ID>',
  );
}

function pnpmInvocation() {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath !== undefined && basename(npmExecPath).toLowerCase().includes('pnpm')) {
    if (/\.(?:cjs|mjs|js)$/iu.test(npmExecPath)) {
      return { command: process.execPath, args: [npmExecPath, 'exec'] };
    }

    return { command: npmExecPath, args: ['exec'] };
  }

  return { command: 'pnpm', args: ['exec'] };
}

function runCapacitor(targetSerial) {
  const pnpm = pnpmInvocation();
  const args = [...pnpm.args, 'cap', 'run', 'android', '--target', targetSerial];
  console.log(`Ejecutando: pnpm exec cap run android --target ${targetSerial}`);

  const child = spawn(pnpm.command, args, {
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });

  child.on('error', (error) => {
    console.error(`No se pudo iniciar Capacitor: ${error.message}`);
    process.exit(1);
  });

  child.on('close', (code, signal) => {
    if (signal !== null) {
      console.error(`Capacitor terminó por señal ${signal}.`);
      process.exit(1);
    }

    process.exit(code ?? 1);
  });
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);

  if (mode === undefined || mode === '--help' || mode === '-h') {
    printGeneralHelp();
    return;
  }

  if (!VALID_MODES.has(mode)) {
    console.error(`Modo no reconocido: ${mode}`);
    printGeneralHelp();
    process.exit(1);
  }

  if (mode === 'run' && (args.includes('--help') || args.includes('-h'))) {
    printRunHelp();
    return;
  }

  if (args.length > 1) {
    console.error('Se esperaba como máximo un ANDROID_TARGET_ID.');
    printGeneralHelp();
    process.exit(1);
  }

  const targets = await readAndroidTargets();

  if (mode === 'targets') {
    printTargets(targets);
    return;
  }

  const requestedSerial = args[0];
  const targetSerial = selectTargetForRun(targets, requestedSerial);
  runCapacitor(targetSerial);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
