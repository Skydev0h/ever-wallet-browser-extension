/** @type {import('vite').UserConfig} */
export default {
  root: 'src/ledger-bridge',
  base: '/everscale-ledger-bridge/',
  build: {
    outDir: '../../dist-ledger',
    assetsDir: './',
    emptyOutDir: true,
  }
}
