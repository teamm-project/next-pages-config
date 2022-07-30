"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  getPagesConfig: () => getPagesConfig
});
module.exports = __toCommonJS(src_exports);
var import_parser = require("@babel/parser");
var t = __toESM(require("@babel/types"));
var import_traverse = __toESM(require("@babel/traverse"));
var import_generator = __toESM(require("@babel/generator"));
var import_promises = __toESM(require("fs/promises"));
var import_glob = __toESM(require("glob"));
var traverseReferenced = (program2, declarations) => {
  const define = (binding) => {
    const declaration = binding.path;
    const declarationIdentifier = declarations.scope.generateUidIdentifier();
    if (declaration.isVariableDeclarator()) {
      const init = declaration.get("init");
      init.traverse(traverseReferenced(program2, declarations));
      declaration.get("id").replaceWith(declarationIdentifier);
      declarations.pushContainer("declarations", declaration.node);
    }
    if (declaration.isImportSpecifier() && t.isImportDeclaration(declaration.parent)) {
      declaration.get("local").replaceWith(declarationIdentifier);
      program2.unshiftContainer(
        "body",
        t.importDeclaration([declaration.node], declaration.parent.source)
      );
    }
    return declarationIdentifier;
  };
  const getIdentifier = (current) => {
    var _a, _b;
    if (!current.isReferenced()) {
      return;
    }
    const binding = current.scope.getBinding(current.node.name);
    if (!binding) {
      return;
    }
    const defName = ((_a = binding.path.get("id").node) == null ? void 0 : _a.name) ?? ((_b = binding.path.get("local").node) == null ? void 0 : _b.name);
    const defined = declarations.scope.hasBinding(defName) ? t.identifier(defName) : define(binding);
    return t.isJSXIdentifier(current) ? t.jsxIdentifier(defined.name) : t.identifier(defined.name);
  };
  const identifierVisitor = (identifierPath) => {
    const identifier2 = getIdentifier(identifierPath);
    if (!identifier2) {
      return;
    }
    identifierPath.replaceWith(identifier2);
  };
  return {
    Identifier: identifierVisitor,
    JSXIdentifier: identifierVisitor
  };
};
var pageVisitor = (pagePath, program2, configs) => ({
  ExportDefaultDeclaration(path) {
    var _a;
    const declaration = path.node.declaration;
    if (!t.isIdentifier(declaration)) {
      return;
    }
    const binding = path.scope.getBinding(declaration.name);
    if (!binding) {
      return;
    }
    for (const referencePath of binding.referencePaths) {
      if (!t.isMemberExpression(referencePath.parent) || !t.isIdentifier(referencePath.parent.property) || referencePath.parent.property.name !== "config") {
        continue;
      }
      const configPath = (_a = referencePath.findParent((p) => t.isAssignmentExpression(p))) == null ? void 0 : _a.get("right");
      if (!configPath || Array.isArray(configPath) || !t.isObjectExpression(configPath.node)) {
        continue;
      }
      const declaration2 = t.variableDeclaration("const", []);
      const [declarationPath] = program2.unshiftContainer("body", declaration2);
      declarationPath.addComment("leading", ` ${pagePath} variables `);
      configPath.traverse(traverseReferenced(program2, declarationPath));
      if (!declarationPath.node.declarations.length) {
        declarationPath.remove();
      }
      configPath.addComment("leading", ` ${pagePath} config `);
      configs.pushContainer("elements", configPath.node);
    }
    path.stop();
  }
});
async function getPagesConfig() {
  const pages = await Promise.all(
    import_glob.default.sync("./pages/**/!(_)*.tsx").map(async (path) => {
      const code = await import_promises.default.readFile(path, {
        encoding: "utf-8"
      });
      return {
        path,
        ast: (0, import_parser.parse)(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        })
      };
    })
  );
  const program2 = t.program([]);
  (0, import_traverse.default)(t.file(program2), {
    Program(path) {
      const configId = path.scope.generateUidIdentifier();
      path.pushContainer("body", [
        t.variableDeclaration("const", [
          t.variableDeclarator(configId, t.arrayExpression())
        ]),
        t.exportDefaultDeclaration(configId)
      ]);
      const configDefinition = path.get("body.0");
      const configsArray = configDefinition.get(
        "declarations.0.init"
      );
      for (const page of pages) {
        (0, import_traverse.default)(page.ast, pageVisitor(page.path, path, configsArray));
      }
    }
  });
  return (0, import_generator.default)(program2);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPagesConfig
});
