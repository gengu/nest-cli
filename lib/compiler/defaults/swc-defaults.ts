import * as ts from 'typescript';
import { Configuration } from '../../configuration';

export const swcDefaultsFactory = (
  tsOptions?: ts.CompilerOptions,
  configuration?: Configuration,
) => {
  // 获取构建器选项
  const builderOptions = configuration?.compilerOptions?.builder && 
    typeof configuration.compilerOptions.builder !== 'string' 
      ? configuration.compilerOptions.builder.options 
      : {};

  // Define SWC compiler options with sensible defaults
  const swcOptions = {
    // Enable source maps based on TypeScript config
    sourceMaps: tsOptions?.sourceMap || (tsOptions?.inlineSourceMap && 'inline'),
    module: { type: 'commonjs' },
    jsc: {
      // Use modern ES2021 target for better performance
      target: 'es2021', 
      parser: {
        syntax: 'typescript',
        decorators: true,
        dynamicImport: true,
      },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        useDefineForClassFields: false,
      },
      keepClassNames: true,
      // Preserve TypeScript path mappings
      baseUrl: tsOptions?.baseUrl,
      paths: tsOptions?.paths,
    },
    minify: false,
    swcrc: true,
  };

  // CLI build configuration
  const cliOptions = {
    // Use TypeScript outDir or default to 'dist'
    outDir: tsOptions?.outDir ? convertPath(tsOptions.outDir) : 'dist',
    // Source files location with fallback
    filenames: [configuration?.sourceRoot ?? 'src'],
    // Default CLI behavior
    sync: false,
    extensions: ['.js', '.ts', '.tsx'],
    copyFiles: false,
    includeDotfiles: false,
    quiet: false,
    watch: false,
    stripLeadingPaths: true,
    // Override defaults with any builder options
    ...builderOptions,
  };

  return {
    swcOptions,
    cliOptions,
  };
};

/**
 * Converts Windows specific file paths to posix
 * @param windowsPath
 */
function convertPath(windowsPath: string) {
  return windowsPath
    .replace(/^\\\\\?\\/, '')
    .replace(/\\/g, '/')
    .replace(/\/\/+/g, '/');
}
