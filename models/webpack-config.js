"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const read_tsconfig_1 = require("../utilities/read-tsconfig");
const require_project_module_1 = require("../utilities/require-project-module");
const webpackMerge = require('webpack-merge');
const config_1 = require("./config");
const webpack_configs_1 = require("./webpack-configs");
const path = require("path");
class NgCliWebpackConfig {
    constructor(buildOptions, appConfig) {
        this.validateBuildOptions(buildOptions);
        const configPath = config_1.CliConfig.configFilePath();
        const projectRoot = path.dirname(configPath);
        appConfig = this.addAppConfigDefaults(appConfig);
        buildOptions = this.addTargetDefaults(buildOptions);
        buildOptions = this.mergeConfigs(buildOptions, appConfig, projectRoot);
        const tsconfigPath = path.resolve(projectRoot, appConfig.root, appConfig.tsconfig);
        const tsConfig = read_tsconfig_1.readTsconfig(tsconfigPath);
        const projectTs = require_project_module_1.requireProjectModule(projectRoot, 'typescript');
        const supportES2015 = tsConfig.options.target !== projectTs.ScriptTarget.ES3
            && tsConfig.options.target !== projectTs.ScriptTarget.ES5;
        this.wco = { projectRoot, buildOptions, appConfig, tsConfig, supportES2015 };
    }
    buildConfig() {
        const platformConfig = this.wco.appConfig.platform === 'server' ?
            webpack_configs_1.getServerConfig(this.wco) : webpack_configs_1.getBrowserConfig(this.wco);
        let webpackConfigs = [
            webpack_configs_1.getCommonConfig(this.wco),
            platformConfig,
            webpack_configs_1.getStylesConfig(this.wco),
        ];
        if (this.wco.appConfig.main || this.wco.appConfig.polyfills) {
            const typescriptConfigPartial = this.wco.buildOptions.aot
                ? webpack_configs_1.getAotConfig(this.wco)
                : webpack_configs_1.getNonAotConfig(this.wco);
            webpackConfigs.push(typescriptConfigPartial);
        }
        this.config = webpackMerge(webpackConfigs);
        return this.config;
    }
    // Validate build options
    validateBuildOptions(buildOptions) {
        buildOptions.target = buildOptions.target || 'development';
        if (buildOptions.target !== 'development' && buildOptions.target !== 'production') {
            throw new Error("Invalid build target. Only 'development' and 'production' are available.");
        }
        if (buildOptions.buildOptimizer
            && !(buildOptions.aot || buildOptions.target === 'production')) {
            throw new Error('The `--build-optimizer` option cannot be used without `--aot`.');
        }
    }
    // Fill in defaults for build targets
    addTargetDefaults(buildOptions) {
        const targetDefaults = {
            development: {
                environment: 'dev',
                outputHashing: 'media',
                sourcemaps: true,
                extractCss: false,
                namedChunks: true,
                aot: false,
                vendorChunk: true,
                buildOptimizer: false,
            },
            production: {
                environment: 'prod',
                outputHashing: 'all',
                sourcemaps: false,
                extractCss: true,
                namedChunks: false,
                aot: true,
                extractLicenses: true,
                vendorChunk: false,
                buildOptimizer: buildOptions.aot !== false,
            }
        };
        return Object.assign({}, targetDefaults[buildOptions.target], buildOptions);
    }
    // Fill in defaults from .angular-cli.json
    mergeConfigs(buildOptions, appConfig, projectRoot) {
        const mergeableOptions = {
            outputPath: path.resolve(projectRoot, appConfig.outDir),
            deployUrl: appConfig.deployUrl,
            baseHref: appConfig.baseHref
        };
        return Object.assign({}, mergeableOptions, buildOptions);
    }
    addAppConfigDefaults(appConfig) {
        const appConfigDefaults = {
            testTsconfig: appConfig.tsconfig,
            scripts: [],
            styles: []
        };
        // can't use Object.assign here because appConfig has a lot of getters/setters
        for (let key of Object.keys(appConfigDefaults)) {
            appConfig[key] = appConfig[key] || appConfigDefaults[key];
        }
        return appConfig;
    }
}
exports.NgCliWebpackConfig = NgCliWebpackConfig;
//# sourceMappingURL=/users/jskrzypek/dev/angular/angular-cli/models/webpack-config.js.map