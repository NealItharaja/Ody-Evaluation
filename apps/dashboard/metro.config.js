// Metro needs to watch the workspace so it can transpile TypeScript from
// packages/* instead of expecting pre-built output.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

function resolvePackage(name) {
  return path.dirname(
    require.resolve(`${name}/package.json`, { paths: [projectRoot, workspaceRoot] }),
  );
}

config.watchFolders = [workspaceRoot];
// Do not walk node_modules from packages/api-client — that picks a second
// @tanstack/react-query and QueryClientProvider context does not match.
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
  '@ody/shared': path.resolve(workspaceRoot, 'packages/shared'),
  '@ody/types': path.resolve(workspaceRoot, 'packages/types'),
  '@ody/api-client': path.resolve(workspaceRoot, 'packages/api-client'),
  '@tanstack/react-query': resolvePackage('@tanstack/react-query'),
  react: resolvePackage('react'),
  'react-dom': resolvePackage('react-dom'),
  'react-native': resolvePackage('react-native'),
};

module.exports = config;
