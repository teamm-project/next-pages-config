import { parse } from "@babel/parser";
import * as t from "@babel/types";
import traverse, {
	Binding,
	NodePath,
	TraverseOptions,
	Visitor,
} from "@babel/traverse";
import build from "@babel/generator";
import fs from "fs/promises";
import glob from "glob";
import path from "path";

const traverseReferenced = (
	program: NodePath<t.Program>,
	declarations: NodePath<t.VariableDeclaration>
): Visitor => {
	type Identifiers = t.Identifier | t.JSXIdentifier;

	const define = (binding: Binding) => {
		const declaration = binding.path;
		const declarationIdentifier = declarations.scope.generateUidIdentifier();

		if (declaration.isVariableDeclarator()) {
			// check for references recursively
			const init = declaration.get("init");
			init.traverse(traverseReferenced(program, declarations));

			// create declaration in program
			declaration.get("id").replaceWith(declarationIdentifier);
			declarations.pushContainer("declarations", declaration.node);
		}

		if (
			declaration.isImportSpecifier() &&
			t.isImportDeclaration(declaration.parent)
		) {
			declaration.get("local").replaceWith(declarationIdentifier);
			program.unshiftContainer(
				"body",
				t.importDeclaration([declaration.node], declaration.parent.source)
			);
		}

		return declarationIdentifier;
	};

	const getIdentifier = (current: NodePath<Identifiers>) => {
		if (!current.isReferenced()) {
			return;
		}

		const binding = current.scope.getBinding(current.node.name);
		if (!binding) {
			return;
		}

		const defName =
			// @ts-ignore
			binding.path.get("id").node?.name ?? binding.path.get("local").node?.name;
		const defined = declarations.scope.hasBinding(defName)
			? t.identifier(defName)
			: define(binding);

		return t.isJSXIdentifier(current)
			? t.jsxIdentifier(defined.name)
			: t.identifier(defined.name);
	};

	const identifierVisitor = (identifierPath: NodePath<Identifiers>) => {
		const identifier = getIdentifier(identifierPath);
		if (!identifier) {
			return;
		}

		identifierPath.replaceWith(identifier);
	};

	return {
		Identifier: identifierVisitor,
		JSXIdentifier: identifierVisitor,
	};
};

const pageVisitor = (
	pagePath: string,
	program: NodePath<t.Program>,
	configs: NodePath<t.ArrayExpression>
): TraverseOptions => ({
	ExportDefaultDeclaration(path) {
		const declaration = path.node.declaration;
		if (!t.isIdentifier(declaration)) {
			return;
		}

		const binding = path.scope.getBinding(declaration.name);
		if (!binding) {
			return;
		}

		for (const referencePath of binding.referencePaths) {
			if (
				!t.isMemberExpression(referencePath.parent) ||
				!t.isIdentifier(referencePath.parent.property) ||
				referencePath.parent.property.name !== "config"
			) {
				continue;
			}

			const configPath = referencePath
				.findParent((p) => t.isAssignmentExpression(p))
				?.get("right");

			if (
				!configPath ||
				Array.isArray(configPath) ||
				!t.isObjectExpression(configPath.node)
			) {
				continue;
			}

			const declaration = t.variableDeclaration("const", []);
			const [declarationPath] = program.unshiftContainer("body", declaration);
			declarationPath.addComment("leading", ` ${pagePath} variables `);

			configPath.traverse(traverseReferenced(program, declarationPath));

			if (!declarationPath.node.declarations.length) {
				declarationPath.remove();
			}

			configPath.addComment("leading", ` ${pagePath} config `);
			configs.pushContainer("elements", configPath.node);
		}

		path.stop();
	},
});

export async function getPagesConfig() {
	const pages = await Promise.all(
		glob.sync("./pages/**/!(_)*.tsx").map(async (path) => {
			const code = await fs.readFile(path, {
				encoding: "utf-8",
			});
			return {
				path,
				ast: parse(code, {
					sourceType: "module",
					plugins: ["jsx", "typescript"],
				}),
			};
		})
	);
	

	const program = t.program([]);
	traverse(t.file(program), {
		Program(path) {
			const configId = path.scope.generateUidIdentifier();
			path.pushContainer("body", [
				t.variableDeclaration("const", [
					t.variableDeclarator(configId, t.arrayExpression()),
				]),
				t.exportDefaultDeclaration(configId),
			]);

			const configDefinition = path.get("body.0") as NodePath;
			const configsArray = configDefinition.get(
				"declarations.0.init"
			) as NodePath<t.ArrayExpression>;

			for (const page of pages) {
				traverse(page.ast, pageVisitor(page.path, path, configsArray));
			}
		},
	});
	
	const pkg = JSON.stringify({
		name:  ".next-pages-config",
		main: 'index.js',
		types: "index.d.ts",
	})

	const dir = path.resolve(__dirname, '../', ".next-pages-config")
	console.log(dir);
	
	
	await fs.mkdir(dir, { recursive: true})
	await fs.writeFile(path.join(dir, 'index.js'), build(program).code, {encoding: 'utf-8'})
	await fs.writeFile(path.join(dir, 'index.d.ts'), 'type PagesConfig = Array<Record<string, any>>; export default PagesConfig;', {encoding: 'utf-8'})
	await fs.writeFile(path.join(dir, 'package.json'), pkg, {encoding: 'utf-8'})
}

getPagesConfig()

declare module "next-pages-config" {
	interface Config {}
}