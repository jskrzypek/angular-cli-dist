"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const common_tags_1 = require("common-tags");
const webpack_1 = require("@ngtools/webpack");
const SilentError = require('silent-error');
const g = global;
const webpackLoader = g['angularCliIsLocal']
    ? g.angularCliPackages['@ngtools/webpack'].main
    : '@ngtools/webpack';
function _createAotPlugin(wco, options, useMain = true) {
    const { appConfig, projectRoot, buildOptions } = wco;
    options.compilerOptions = options.compilerOptions || {};
    if (wco.buildOptions.preserveSymlinks) {
        options.compilerOptions.preserveSymlinks = true;
    }
    // Read the environment, and set it in the compiler host.
    let hostReplacementPaths = {};
    // process environment file replacement
    if (appConfig.environments) {
        if (!appConfig.environmentSource) {
            let migrationMessage = '';
            if ('source' in appConfig.environments) {
                migrationMessage = '\n\n' + common_tags_1.stripIndent `
          A new environmentSource entry replaces the previous source entry inside environments.

          To migrate angular-cli.json follow the example below:

          Before:

          "environments": {
            "source": "environments/environment.ts",
            "dev": "environments/environment.ts",
            "prod": "environments/environment.prod.ts"
          }


          After:

          "environmentSource": "environments/environment.ts",
          "environments": {
            "dev": "environments/environment.ts",
            "prod": "environments/environment.prod.ts"
          }
        `;
            }
            throw new SilentError(`Environment configuration does not contain "environmentSource" entry.${migrationMessage}`);
        }
        if (!(buildOptions.environment in appConfig.environments)) {
            throw new SilentError(`Environment "${buildOptions.environment}" does not exist.`);
        }
        const appRoot = path.resolve(projectRoot, appConfig.root);
        const sourcePath = appConfig.environmentSource;
        const envFile = appConfig.environments[buildOptions.environment];
        hostReplacementPaths = {
            [path.resolve(appRoot, sourcePath)]: path.resolve(appRoot, envFile)
        };
    }
    const additionalLazyModules = {};
    if (appConfig.lazyModules) {
        for (const lazyModule of appConfig.lazyModules) {
            additionalLazyModules[lazyModule] = path.resolve(projectRoot, appConfig.root, lazyModule);
        }
    }
    const pluginOptions = Object.assign({ mainPath: useMain ? path.join(projectRoot, appConfig.root, appConfig.main) : undefined, i18nInFile: buildOptions.i18nFile, i18nInFormat: buildOptions.i18nFormat, i18nOutFile: buildOptions.i18nOutFile, i18nOutFormat: buildOptions.i18nOutFormat, locale: buildOptions.locale, platform: appConfig.platform === 'server' ? webpack_1.PLATFORM.Server : webpack_1.PLATFORM.Browser, missingTranslation: buildOptions.missingTranslation, hostReplacementPaths, sourceMap: buildOptions.sourcemaps, additionalLazyModules, nameLazyFiles: buildOptions.namedChunks }, options);
    return new webpack_1.AngularCompilerPlugin(pluginOptions);
}
function getNonAotConfig(wco) {
    const { appConfig, projectRoot } = wco;
    const tsConfigPath = path.resolve(projectRoot, appConfig.root, appConfig.tsconfig);
    return {
        module: { rules: [{ test: /\.ts$/, loader: webpackLoader }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath, skipCodeGeneration: true })]
    };
}
exports.getNonAotConfig = getNonAotConfig;
function getAotConfig(wco) {
    const { projectRoot, buildOptions, appConfig } = wco;
    const tsConfigPath = path.resolve(projectRoot, appConfig.root, appConfig.tsconfig);
    const loaders = [webpackLoader];
    if (buildOptions.buildOptimizer) {
        loaders.unshift({
            loader: '@angular-devkit/build-optimizer/webpack-loader',
            options: { sourceMap: buildOptions.sourcemaps }
        });
    }
    const test = /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/;
    return {
        module: { rules: [{ test, use: loaders }] },
        plugins: [_createAotPlugin(wco, { tsConfigPath })]
    };
}
exports.getAotConfig = getAotConfig;
function getNonAotTestConfig(wco) {
    const { projectRoot, appConfig } = wco;
    const tsConfigPath = path.resolve(projectRoot, appConfig.root, appConfig.testTsconfig);
    let pluginOptions = { tsConfigPath, skipCodeGeneration: true };
    if (appConfig.polyfills) {
        // TODO: remove singleFileIncludes for 2.0, this is just to support old projects that did not
        // include 'polyfills.ts' in `tsconfig.spec.json'.
        const polyfillsPath = path.resolve(projectRoot, appConfig.root, appConfig.polyfills);
        pluginOptions.singleFileIncludes = [polyfillsPath];
    }
    return {
        module: { rules: [{ test: /\.ts$/, loader: webpackLoader }] },
        plugins: [_createAotPlugin(wco, pluginOptions, false)]
    };
}
exports.getNonAotTestConfig = getNonAotTestConfig;
//# sourceMappingURL=/users/jskrzypek/dev/angular/angular-cli/models/webpack-configs/typescript.js.map