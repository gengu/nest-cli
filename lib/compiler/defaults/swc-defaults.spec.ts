import { describe, it, expect, beforeEach } from 'vitest';
import * as ts from 'typescript';
import { swcDefaultsFactory } from './swc-defaults';
import { Configuration } from '../../configuration';

describe('swcDefaultsFactory', () => {
  let tsOptions: ts.CompilerOptions;
  let configuration: Configuration;

  beforeEach(() => {
    tsOptions = {
      sourceMap: true,
      baseUrl: './src',
      paths: {
        '@app/*': ['app/*'],
      },
      outDir: './dist',
    };

    configuration = {
      compilerOptions: {
        builder: {
          options: {
            sync: true,
            quiet: true,
          },
        },
      },
      sourceRoot: 'src',
    };
  });

  it('should generate default SWC options with given tsOptions and configuration', () => {
    const result = swcDefaultsFactory(tsOptions, configuration);

    expect(result.swcOptions).toEqual({
      sourceMaps: true,
      module: { type: 'commonjs' },
      jsc: {
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
        baseUrl: './src',
        paths: {
          '@app/*': ['app/*'],
        },
      },
      minify: false,
      swcrc: true,
    });

    expect(result.cliOptions).toEqual({
      outDir: './dist',
      filenames: ['src'],
      sync: true,
      extensions: ['.js', '.ts'],
      copyFiles: false,
      includeDotfiles: false,
      quiet: true,
      watch: false,
      stripLeadingPaths: true,
    });
  });

  it('should handle undefined tsOptions and configuration', () => {
    const result = swcDefaultsFactory(undefined, undefined);

    expect(result.swcOptions).toEqual({
      sourceMaps: undefined,
      module: { type: 'commonjs' },
      jsc: {
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
        baseUrl: undefined,
        paths: undefined,
      },
      minify: false,
      swcrc: true,
    });

    expect(result.cliOptions).toEqual({
      outDir: 'dist',
      filenames: ['src'],
      sync: false,
      extensions: ['.js', '.ts'],
      copyFiles: false,
      includeDotfiles: false,
      quiet: false,
      watch: false,
      stripLeadingPaths: true,
    });
  });

  it('should convert Windows paths to POSIX in cliOptions outDir', () => {
    tsOptions.outDir = 'C:\\project\\dist';
    const result = swcDefaultsFactory(tsOptions, configuration);

    expect(result.cliOptions.outDir).toBe('C:/project/dist');
  });

  it('should handle inlineSourceMap option in tsOptions', () => {
    tsOptions.sourceMap = false;
    tsOptions.inlineSourceMap = true;
    const result = swcDefaultsFactory(tsOptions, configuration);

    expect(result.swcOptions.sourceMaps).toBe('inline');
  });

  it('should override cliOptions with builderOptions from configuration', () => {
    configuration.compilerOptions.builder = {
      options: {
        watch: true,
        sync: true,
      },
    };

    const result = swcDefaultsFactory(tsOptions, configuration);

    expect(result.cliOptions.watch).toBe(true);
    expect(result.cliOptions.sync).toBe(true);
  });
});
