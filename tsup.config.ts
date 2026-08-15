import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    // El paquete no depende de nada de Node: el mismo bundle sirve en el navegador.
    target: 'es2022',
    platform: 'neutral',
});
