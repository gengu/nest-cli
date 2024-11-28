import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { swcDefaultsFactory } from './swc-defaults';
import { Configuration } from '../../configuration';

describe('swcDefaultsFactory', () => {
  it('should generate default SWC options when no tsOptions and configuration are provided', () => {
    const result = swcDefaultsFactory();
    expect(result).toEqual({
      swcOptions: {
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
      },
      cliOptions: {
        outDir: 'dist',
        filenames: ['src'],
        sync: false,
        extensions: ['.js', '.ts', '.tsx'],
        copyFiles: false,
        includeDotfiles: false,
        quiet: false,
        watch: false,
        stripLeadingPaths: true,
      },
    });
  });

  it('should generate SWC options with provided tsOptions', () => {
    const tsOptions: ts.CompilerOptions = {
      sourceMap: true,
      baseUrl: './src',
      paths: { '@app/*': ['app/*'] },
      outDir: './build',
    };
    const result = swcDefaultsFactory(tsOptions);
    expect(result.swcOptions.sourceMaps).toBe(true);
    expect(result.swcOptions.jsc.baseUrl).toBe('./src');
    expect(result.swcOptions.jsc.paths).toEqual({ '@app/*': ['app/*'] });
    expect(result.cliOptions.outDir).toBe('./build');
  });

  it('should generate SWC options with provided configuration', () => {
    const configuration: Configuration = {
      compilerOptions: {
        builder: {
          options: {
            quiet: true,
            watch: true,
          },
        },
      },
      sourceRoot: 'lib',
    };
    const result = swcDefaultsFactory(undefined, configuration);
    expect(result.cliOptions.quiet).toBe(true);
    expect(result.cliOptions.watch).toBe(true);
    expect(result.cliOptions.filenames).toEqual(['lib']);
  });

  it('should handle builder options in configuration', () => {
    const configuration: Configuration = {
      compilerOptions: {
        builder: {
          options: {
            extensions: ['.jsx'],
            copyFiles: true,
          },
        },
      },
    };
    const result = swcDefaultsFactory(undefined, configuration);
    expect(result.cliOptions.extensions).toEqual(['.jsx']);
    expect(result.cliOptions.copyFiles).toBe(true);
  });

  it('should default to "dist" outDir if tsOptions.outDir is not provided', () => {
    const tsOptions: ts.CompilerOptions = {};
    const result = swcDefaultsFactory(tsOptions);
    expect(result.cliOptions.outDir).toBe('dist');
  });
});
