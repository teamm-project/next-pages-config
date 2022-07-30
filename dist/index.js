import { parse } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import build from '@babel/generator';
import fs from 'fs/promises';
import glob from 'glob';
import path from 'path';

const traverseReferenced = (program, declarations) => {
  const define = (binding) => {
    const declaration = binding.path;
    const declarationIdentifier = declarations.scope.generateUidIdentifier();
    if (declaration.isVariableDeclarator()) {
      const init = declaration.get("init");
      init.traverse(traverseReferenced(program, declarations));
      declaration.get("id").replaceWith(declarationIdentifier);
      declarations.pushContainer("declarations", declaration.node);
    }
    if (declaration.isImportSpecifier() && t.isImportDeclaration(declaration.parent)) {
      declaration.get("local").replaceWith(declarationIdentifier);
      program.unshiftContainer(
        "body",
        t.importDeclaration([declaration.node], declaration.parent.source)
      );
    }
    return declarationIdentifier;
  };
  const getIdentifier = (current) => {
    var _a, _b, _c;
    if (!current.isReferenced()) {
      return;
    }
    const binding = current.scope.getBinding(current.node.name);
    if (!binding) {
      return;
    }
    const defName = (_c = (_a = binding.path.get("id").node) == null ? void 0 : _a.name) != null ? _c : (_b = binding.path.get("local").node) == null ? void 0 : _b.name;
    const defined = declarations.scope.hasBinding(defName) ? t.identifier(defName) : define(binding);
    return t.isJSXIdentifier(current) ? t.jsxIdentifier(defined.name) : t.identifier(defined.name);
  };
  const identifierVisitor = (identifierPath) => {
    const identifier = getIdentifier(identifierPath);
    if (!identifier) {
      return;
    }
    identifierPath.replaceWith(identifier);
  };
  return {
    Identifier: identifierVisitor,
    JSXIdentifier: identifierVisitor
  };
};
const pageVisitor = (pagePath, program, configs) => ({
  ExportDefaultDeclaration(path2) {
    var _a;
    const declaration = path2.node.declaration;
    if (!t.isIdentifier(declaration)) {
      return;
    }
    const binding = path2.scope.getBinding(declaration.name);
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
      const [declarationPath] = program.unshiftContainer("body", declaration2);
      declarationPath.addComment("leading", ` ${pagePath} variables `);
      configPath.traverse(traverseReferenced(program, declarationPath));
      if (!declarationPath.node.declarations.length) {
        declarationPath.remove();
      }
      configPath.addComment("leading", ` ${pagePath} config `);
      configs.pushContainer("elements", configPath.node);
    }
    path2.stop();
  }
});
async function getPagesConfig() {
  const pages = await Promise.all(
    glob.sync("./pages/**/!(_)*.tsx").map(async (path2) => {
      const code = await fs.readFile(path2, {
        encoding: "utf-8"
      });
      return {
        path: path2,
        ast: parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        })
      };
    })
  );
  const program = t.program([]);
  traverse(t.file(program), {
    Program(path2) {
      const configId = path2.scope.generateUidIdentifier();
      path2.pushContainer("body", [
        t.variableDeclaration("const", [
          t.variableDeclarator(configId, t.arrayExpression())
        ]),
        t.exportDefaultDeclaration(configId)
      ]);
      const configDefinition = path2.get("body.0");
      const configsArray = configDefinition.get(
        "declarations.0.init"
      );
      for (const page of pages) {
        traverse(page.ast, pageVisitor(page.path, path2, configsArray));
      }
    }
  });
  const pkg = JSON.stringify({
    name: ".next-pages-config",
    main: "index.js",
    types: "index.d.ts"
  });
  const dir = path.resolve(__dirname, "../", ".next-pages-config");
  console.log(dir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.js"), build(program).code, { encoding: "utf-8" });
  await fs.writeFile(path.join(dir, "index.d.ts"), "type PagesConfig = Array<Record<string, any>>; export default PagesConfig;", { encoding: "utf-8" });
  await fs.writeFile(path.join(dir, "package.json"), pkg, { encoding: "utf-8" });
}
getPagesConfig();

export { getPagesConfig };
