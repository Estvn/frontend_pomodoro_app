const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Esto permite usar '@/' como alias hacia la raíz del proyecto
config.resolver.extraNodeModules = {
  "@": __dirname
};

module.exports = config;
