// src/index.ts
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import build from "@babel/generator";
import fs from "fs/promises";
import glob from "glob";
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
    glob.sync("./pages/**/!(_)*.tsx").map(async (path) => {
      const code = await fs.readFile(path, {
        encoding: "utf-8"
      });
      return {
        path,
        ast: parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        })
      };
    })
  );
  const program2 = t.program([]);
  traverse(t.file(program2), {
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
        traverse(page.ast, pageVisitor(page.path, path, configsArray));
      }
    }
  });
  return build(program2);
}

export {
  getPagesConfig
};
