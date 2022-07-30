"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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

// node_modules/.pnpm/@babel+helper-plugin-utils@7.18.9/node_modules/@babel/helper-plugin-utils/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/@babel+helper-plugin-utils@7.18.9/node_modules/@babel/helper-plugin-utils/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.declare = declare;
    exports.declarePreset = void 0;
    function declare(builder) {
      return (api, options, dirname) => {
        var _clonedApi2;
        let clonedApi;
        for (const name of Object.keys(apiPolyfills)) {
          var _clonedApi;
          if (api[name])
            continue;
          clonedApi = (_clonedApi = clonedApi) != null ? _clonedApi : copyApiObject(api);
          clonedApi[name] = apiPolyfills[name](clonedApi);
        }
        return builder((_clonedApi2 = clonedApi) != null ? _clonedApi2 : api, options || {}, dirname);
      };
    }
    var declarePreset = declare;
    exports.declarePreset = declarePreset;
    var apiPolyfills = {
      assertVersion: (api) => (range) => {
        throwVersionError(range, api.version);
      },
      targets: () => () => {
        return {};
      },
      assumption: () => () => {
        return void 0;
      }
    };
    function copyApiObject(api) {
      let proto = null;
      if (typeof api.version === "string" && /^7\./.test(api.version)) {
        proto = Object.getPrototypeOf(api);
        if (proto && (!has(proto, "version") || !has(proto, "transform") || !has(proto, "template") || !has(proto, "types"))) {
          proto = null;
        }
      }
      return Object.assign({}, proto, api);
    }
    function has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    function throwVersionError(range, version) {
      if (typeof range === "number") {
        if (!Number.isInteger(range)) {
          throw new Error("Expected string or integer value.");
        }
        range = `^${range}.0.0-0`;
      }
      if (typeof range !== "string") {
        throw new Error("Expected string or integer value.");
      }
      const limit = Error.stackTraceLimit;
      if (typeof limit === "number" && limit < 25) {
        Error.stackTraceLimit = 25;
      }
      let err;
      if (version.slice(0, 2) === "7.") {
        err = new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". You'll need to update your @babel/core version.`);
      } else {
        err = new Error(`Requires Babel "${range}", but was loaded with "${version}". If you are sure you have a compatible version of @babel/core, it is likely that something in your build process is loading the wrong version. Inspect the stack trace of this error to look for the first entry that doesn't mention "@babel/core" or "babel-core" to see what is calling Babel.`);
      }
      if (typeof limit === "number") {
        Error.stackTraceLimit = limit;
      }
      throw Object.assign(err, {
        code: "BABEL_VERSION_UNSUPPORTED",
        version,
        range
      });
    }
  }
});

// node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/import-builder.js
var require_import_builder = __commonJS({
  "node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/import-builder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _assert = require("assert");
    var _t = require("@babel/types");
    var {
      callExpression,
      cloneNode,
      expressionStatement,
      identifier: identifier2,
      importDeclaration: importDeclaration2,
      importDefaultSpecifier: importDefaultSpecifier2,
      importNamespaceSpecifier,
      importSpecifier,
      memberExpression,
      stringLiteral: stringLiteral2,
      variableDeclaration: variableDeclaration2,
      variableDeclarator: variableDeclarator2
    } = _t;
    var ImportBuilder = class {
      constructor(importedSource, scope, hub) {
        this._statements = [];
        this._resultName = null;
        this._importedSource = void 0;
        this._scope = scope;
        this._hub = hub;
        this._importedSource = importedSource;
      }
      done() {
        return {
          statements: this._statements,
          resultName: this._resultName
        };
      }
      import() {
        this._statements.push(importDeclaration2([], stringLiteral2(this._importedSource)));
        return this;
      }
      require() {
        this._statements.push(expressionStatement(callExpression(identifier2("require"), [stringLiteral2(this._importedSource)])));
        return this;
      }
      namespace(name = "namespace") {
        const local = this._scope.generateUidIdentifier(name);
        const statement = this._statements[this._statements.length - 1];
        _assert(statement.type === "ImportDeclaration");
        _assert(statement.specifiers.length === 0);
        statement.specifiers = [importNamespaceSpecifier(local)];
        this._resultName = cloneNode(local);
        return this;
      }
      default(name) {
        const id = this._scope.generateUidIdentifier(name);
        const statement = this._statements[this._statements.length - 1];
        _assert(statement.type === "ImportDeclaration");
        _assert(statement.specifiers.length === 0);
        statement.specifiers = [importDefaultSpecifier2(id)];
        this._resultName = cloneNode(id);
        return this;
      }
      named(name, importName) {
        if (importName === "default")
          return this.default(name);
        const id = this._scope.generateUidIdentifier(name);
        const statement = this._statements[this._statements.length - 1];
        _assert(statement.type === "ImportDeclaration");
        _assert(statement.specifiers.length === 0);
        statement.specifiers = [importSpecifier(id, identifier2(importName))];
        this._resultName = cloneNode(id);
        return this;
      }
      var(name) {
        const id = this._scope.generateUidIdentifier(name);
        let statement = this._statements[this._statements.length - 1];
        if (statement.type !== "ExpressionStatement") {
          _assert(this._resultName);
          statement = expressionStatement(this._resultName);
          this._statements.push(statement);
        }
        this._statements[this._statements.length - 1] = variableDeclaration2("var", [variableDeclarator2(id, statement.expression)]);
        this._resultName = cloneNode(id);
        return this;
      }
      defaultInterop() {
        return this._interop(this._hub.addHelper("interopRequireDefault"));
      }
      wildcardInterop() {
        return this._interop(this._hub.addHelper("interopRequireWildcard"));
      }
      _interop(callee) {
        const statement = this._statements[this._statements.length - 1];
        if (statement.type === "ExpressionStatement") {
          statement.expression = callExpression(callee, [statement.expression]);
        } else if (statement.type === "VariableDeclaration") {
          _assert(statement.declarations.length === 1);
          statement.declarations[0].init = callExpression(callee, [statement.declarations[0].init]);
        } else {
          _assert.fail("Unexpected type.");
        }
        return this;
      }
      prop(name) {
        const statement = this._statements[this._statements.length - 1];
        if (statement.type === "ExpressionStatement") {
          statement.expression = memberExpression(statement.expression, identifier2(name));
        } else if (statement.type === "VariableDeclaration") {
          _assert(statement.declarations.length === 1);
          statement.declarations[0].init = memberExpression(statement.declarations[0].init, identifier2(name));
        } else {
          _assert.fail("Unexpected type:" + statement.type);
        }
        return this;
      }
      read(name) {
        this._resultName = memberExpression(this._resultName, identifier2(name));
      }
    };
    exports.default = ImportBuilder;
  }
});

// node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/is-module.js
var require_is_module = __commonJS({
  "node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/is-module.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isModule;
    function isModule(path2) {
      const {
        sourceType
      } = path2.node;
      if (sourceType !== "module" && sourceType !== "script") {
        throw path2.buildCodeFrameError(`Unknown sourceType "${sourceType}", cannot transform.`);
      }
      return path2.node.sourceType === "module";
    }
  }
});

// node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/import-injector.js
var require_import_injector = __commonJS({
  "node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/import-injector.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _assert = require("assert");
    var _t = require("@babel/types");
    var _importBuilder = require_import_builder();
    var _isModule = require_is_module();
    var {
      numericLiteral,
      sequenceExpression
    } = _t;
    var ImportInjector = class {
      constructor(path2, importedSource, opts) {
        this._defaultOpts = {
          importedSource: null,
          importedType: "commonjs",
          importedInterop: "babel",
          importingInterop: "babel",
          ensureLiveReference: false,
          ensureNoContext: false,
          importPosition: "before"
        };
        const programPath = path2.find((p) => p.isProgram());
        this._programPath = programPath;
        this._programScope = programPath.scope;
        this._hub = programPath.hub;
        this._defaultOpts = this._applyDefaults(importedSource, opts, true);
      }
      addDefault(importedSourceIn, opts) {
        return this.addNamed("default", importedSourceIn, opts);
      }
      addNamed(importName, importedSourceIn, opts) {
        _assert(typeof importName === "string");
        return this._generateImport(this._applyDefaults(importedSourceIn, opts), importName);
      }
      addNamespace(importedSourceIn, opts) {
        return this._generateImport(this._applyDefaults(importedSourceIn, opts), null);
      }
      addSideEffect(importedSourceIn, opts) {
        return this._generateImport(this._applyDefaults(importedSourceIn, opts), void 0);
      }
      _applyDefaults(importedSource, opts, isInit = false) {
        let newOpts;
        if (typeof importedSource === "string") {
          newOpts = Object.assign({}, this._defaultOpts, {
            importedSource
          }, opts);
        } else {
          _assert(!opts, "Unexpected secondary arguments.");
          newOpts = Object.assign({}, this._defaultOpts, importedSource);
        }
        if (!isInit && opts) {
          if (opts.nameHint !== void 0)
            newOpts.nameHint = opts.nameHint;
          if (opts.blockHoist !== void 0)
            newOpts.blockHoist = opts.blockHoist;
        }
        return newOpts;
      }
      _generateImport(opts, importName) {
        const isDefault = importName === "default";
        const isNamed = !!importName && !isDefault;
        const isNamespace = importName === null;
        const {
          importedSource,
          importedType,
          importedInterop,
          importingInterop,
          ensureLiveReference,
          ensureNoContext,
          nameHint,
          importPosition,
          blockHoist
        } = opts;
        let name = nameHint || importName;
        const isMod = (0, _isModule.default)(this._programPath);
        const isModuleForNode = isMod && importingInterop === "node";
        const isModuleForBabel = isMod && importingInterop === "babel";
        if (importPosition === "after" && !isMod) {
          throw new Error(`"importPosition": "after" is only supported in modules`);
        }
        const builder = new _importBuilder.default(importedSource, this._programScope, this._hub);
        if (importedType === "es6") {
          if (!isModuleForNode && !isModuleForBabel) {
            throw new Error("Cannot import an ES6 module from CommonJS");
          }
          builder.import();
          if (isNamespace) {
            builder.namespace(nameHint || importedSource);
          } else if (isDefault || isNamed) {
            builder.named(name, importName);
          }
        } else if (importedType !== "commonjs") {
          throw new Error(`Unexpected interopType "${importedType}"`);
        } else if (importedInterop === "babel") {
          if (isModuleForNode) {
            name = name !== "default" ? name : importedSource;
            const es6Default = `${importedSource}$es6Default`;
            builder.import();
            if (isNamespace) {
              builder.default(es6Default).var(name || importedSource).wildcardInterop();
            } else if (isDefault) {
              if (ensureLiveReference) {
                builder.default(es6Default).var(name || importedSource).defaultInterop().read("default");
              } else {
                builder.default(es6Default).var(name).defaultInterop().prop(importName);
              }
            } else if (isNamed) {
              builder.default(es6Default).read(importName);
            }
          } else if (isModuleForBabel) {
            builder.import();
            if (isNamespace) {
              builder.namespace(name || importedSource);
            } else if (isDefault || isNamed) {
              builder.named(name, importName);
            }
          } else {
            builder.require();
            if (isNamespace) {
              builder.var(name || importedSource).wildcardInterop();
            } else if ((isDefault || isNamed) && ensureLiveReference) {
              if (isDefault) {
                name = name !== "default" ? name : importedSource;
                builder.var(name).read(importName);
                builder.defaultInterop();
              } else {
                builder.var(importedSource).read(importName);
              }
            } else if (isDefault) {
              builder.var(name).defaultInterop().prop(importName);
            } else if (isNamed) {
              builder.var(name).prop(importName);
            }
          }
        } else if (importedInterop === "compiled") {
          if (isModuleForNode) {
            builder.import();
            if (isNamespace) {
              builder.default(name || importedSource);
            } else if (isDefault || isNamed) {
              builder.default(importedSource).read(name);
            }
          } else if (isModuleForBabel) {
            builder.import();
            if (isNamespace) {
              builder.namespace(name || importedSource);
            } else if (isDefault || isNamed) {
              builder.named(name, importName);
            }
          } else {
            builder.require();
            if (isNamespace) {
              builder.var(name || importedSource);
            } else if (isDefault || isNamed) {
              if (ensureLiveReference) {
                builder.var(importedSource).read(name);
              } else {
                builder.prop(importName).var(name);
              }
            }
          }
        } else if (importedInterop === "uncompiled") {
          if (isDefault && ensureLiveReference) {
            throw new Error("No live reference for commonjs default");
          }
          if (isModuleForNode) {
            builder.import();
            if (isNamespace) {
              builder.default(name || importedSource);
            } else if (isDefault) {
              builder.default(name);
            } else if (isNamed) {
              builder.default(importedSource).read(name);
            }
          } else if (isModuleForBabel) {
            builder.import();
            if (isNamespace) {
              builder.default(name || importedSource);
            } else if (isDefault) {
              builder.default(name);
            } else if (isNamed) {
              builder.named(name, importName);
            }
          } else {
            builder.require();
            if (isNamespace) {
              builder.var(name || importedSource);
            } else if (isDefault) {
              builder.var(name);
            } else if (isNamed) {
              if (ensureLiveReference) {
                builder.var(importedSource).read(name);
              } else {
                builder.var(name).prop(importName);
              }
            }
          }
        } else {
          throw new Error(`Unknown importedInterop "${importedInterop}".`);
        }
        const {
          statements,
          resultName
        } = builder.done();
        this._insertStatements(statements, importPosition, blockHoist);
        if ((isDefault || isNamed) && ensureNoContext && resultName.type !== "Identifier") {
          return sequenceExpression([numericLiteral(0), resultName]);
        }
        return resultName;
      }
      _insertStatements(statements, importPosition = "before", blockHoist = 3) {
        const body = this._programPath.get("body");
        if (importPosition === "after") {
          for (let i = body.length - 1; i >= 0; i--) {
            if (body[i].isImportDeclaration()) {
              body[i].insertAfter(statements);
              return;
            }
          }
        } else {
          statements.forEach((node) => {
            node._blockHoist = blockHoist;
          });
          const targetPath = body.find((p) => {
            const val = p.node._blockHoist;
            return Number.isFinite(val) && val < 4;
          });
          if (targetPath) {
            targetPath.insertBefore(statements);
            return;
          }
        }
        this._programPath.unshiftContainer("body", statements);
      }
    };
    exports.default = ImportInjector;
  }
});

// node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/.pnpm/@babel+helper-module-imports@7.18.6/node_modules/@babel/helper-module-imports/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "ImportInjector", {
      enumerable: true,
      get: function() {
        return _importInjector.default;
      }
    });
    exports.addDefault = addDefault;
    exports.addNamed = addNamed;
    exports.addNamespace = addNamespace;
    exports.addSideEffect = addSideEffect;
    Object.defineProperty(exports, "isModule", {
      enumerable: true,
      get: function() {
        return _isModule.default;
      }
    });
    var _importInjector = require_import_injector();
    var _isModule = require_is_module();
    function addDefault(path2, importedSource, opts) {
      return new _importInjector.default(path2).addDefault(importedSource, opts);
    }
    function addNamed(path2, name, importedSource, opts) {
      return new _importInjector.default(path2).addNamed(name, importedSource, opts);
    }
    function addNamespace(path2, importedSource, opts) {
      return new _importInjector.default(path2).addNamespace(importedSource, opts);
    }
    function addSideEffect(path2, importedSource, opts) {
      return new _importInjector.default(path2).addSideEffect(importedSource, opts);
    }
  }
});

// node_modules/.pnpm/@babel+helper-annotate-as-pure@7.18.6/node_modules/@babel/helper-annotate-as-pure/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/.pnpm/@babel+helper-annotate-as-pure@7.18.6/node_modules/@babel/helper-annotate-as-pure/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = annotateAsPure;
    var _t = require("@babel/types");
    var {
      addComment
    } = _t;
    var PURE_ANNOTATION = "#__PURE__";
    var isPureAnnotated = ({
      leadingComments
    }) => !!leadingComments && leadingComments.some((comment) => /[@#]__PURE__/.test(comment.value));
    function annotateAsPure(pathOrNode) {
      const node = pathOrNode["node"] || pathOrNode;
      if (isPureAnnotated(node)) {
        return;
      }
      addComment(node, "leading", PURE_ANNOTATION);
    }
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/create-plugin.js
var require_create_plugin = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/create-plugin.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = createPlugin;
    var _pluginSyntaxJsx = require("@babel/plugin-syntax-jsx");
    var _helperPluginUtils = require_lib();
    var _core = require("@babel/core");
    var _helperModuleImports = require_lib2();
    var _helperAnnotateAsPure = require_lib3();
    var DEFAULT = {
      importSource: "react",
      runtime: "automatic",
      pragma: "React.createElement",
      pragmaFrag: "React.Fragment"
    };
    var JSX_SOURCE_ANNOTATION_REGEX = /^\s*\*?\s*@jsxImportSource\s+([^\s]+)\s*$/m;
    var JSX_RUNTIME_ANNOTATION_REGEX = /^\s*\*?\s*@jsxRuntime\s+([^\s]+)\s*$/m;
    var JSX_ANNOTATION_REGEX = /^\s*\*?\s*@jsx\s+([^\s]+)\s*$/m;
    var JSX_FRAG_ANNOTATION_REGEX = /^\s*\*?\s*@jsxFrag\s+([^\s]+)\s*$/m;
    var get = (pass, name) => pass.get(`@babel/plugin-react-jsx/${name}`);
    var set = (pass, name, v) => pass.set(`@babel/plugin-react-jsx/${name}`, v);
    function createPlugin({
      name,
      development
    }) {
      return (0, _helperPluginUtils.declare)((_, options) => {
        const {
          pure: PURE_ANNOTATION,
          throwIfNamespace = true,
          filter,
          runtime: RUNTIME_DEFAULT = development ? "automatic" : "classic",
          importSource: IMPORT_SOURCE_DEFAULT = DEFAULT.importSource,
          pragma: PRAGMA_DEFAULT = DEFAULT.pragma,
          pragmaFrag: PRAGMA_FRAG_DEFAULT = DEFAULT.pragmaFrag
        } = options;
        {
          var {
            useSpread = false,
            useBuiltIns = false
          } = options;
          if (RUNTIME_DEFAULT === "classic") {
            if (typeof useSpread !== "boolean") {
              throw new Error("transform-react-jsx currently only accepts a boolean option for useSpread (defaults to false)");
            }
            if (typeof useBuiltIns !== "boolean") {
              throw new Error("transform-react-jsx currently only accepts a boolean option for useBuiltIns (defaults to false)");
            }
            if (useSpread && useBuiltIns) {
              throw new Error("transform-react-jsx currently only accepts useBuiltIns or useSpread but not both");
            }
          }
        }
        const injectMetaPropertiesVisitor = {
          JSXOpeningElement(path2, state) {
            const attributes = [];
            if (isThisAllowed(path2.scope)) {
              attributes.push(_core.types.jsxAttribute(_core.types.jsxIdentifier("__self"), _core.types.jsxExpressionContainer(_core.types.thisExpression())));
            }
            attributes.push(_core.types.jsxAttribute(_core.types.jsxIdentifier("__source"), _core.types.jsxExpressionContainer(makeSource(path2, state))));
            path2.pushContainer("attributes", attributes);
          }
        };
        return {
          name,
          inherits: _pluginSyntaxJsx.default,
          visitor: {
            JSXNamespacedName(path2) {
              if (throwIfNamespace) {
                throw path2.buildCodeFrameError(`Namespace tags are not supported by default. React's JSX doesn't support namespace tags. You can set \`throwIfNamespace: false\` to bypass this warning.`);
              }
            },
            JSXSpreadChild(path2) {
              throw path2.buildCodeFrameError("Spread children are not supported in React.");
            },
            Program: {
              enter(path2, state) {
                const {
                  file: file2
                } = state;
                let runtime = RUNTIME_DEFAULT;
                let source = IMPORT_SOURCE_DEFAULT;
                let pragma = PRAGMA_DEFAULT;
                let pragmaFrag = PRAGMA_FRAG_DEFAULT;
                let sourceSet = !!options.importSource;
                let pragmaSet = !!options.pragma;
                let pragmaFragSet = !!options.pragmaFrag;
                if (file2.ast.comments) {
                  for (const comment of file2.ast.comments) {
                    const sourceMatches = JSX_SOURCE_ANNOTATION_REGEX.exec(comment.value);
                    if (sourceMatches) {
                      source = sourceMatches[1];
                      sourceSet = true;
                    }
                    const runtimeMatches = JSX_RUNTIME_ANNOTATION_REGEX.exec(comment.value);
                    if (runtimeMatches) {
                      runtime = runtimeMatches[1];
                    }
                    const jsxMatches = JSX_ANNOTATION_REGEX.exec(comment.value);
                    if (jsxMatches) {
                      pragma = jsxMatches[1];
                      pragmaSet = true;
                    }
                    const jsxFragMatches = JSX_FRAG_ANNOTATION_REGEX.exec(comment.value);
                    if (jsxFragMatches) {
                      pragmaFrag = jsxFragMatches[1];
                      pragmaFragSet = true;
                    }
                  }
                }
                set(state, "runtime", runtime);
                if (runtime === "classic") {
                  if (sourceSet) {
                    throw path2.buildCodeFrameError(`importSource cannot be set when runtime is classic.`);
                  }
                  const createElement = toMemberExpression(pragma);
                  const fragment = toMemberExpression(pragmaFrag);
                  set(state, "id/createElement", () => _core.types.cloneNode(createElement));
                  set(state, "id/fragment", () => _core.types.cloneNode(fragment));
                  set(state, "defaultPure", pragma === DEFAULT.pragma);
                } else if (runtime === "automatic") {
                  if (pragmaSet || pragmaFragSet) {
                    throw path2.buildCodeFrameError(`pragma and pragmaFrag cannot be set when runtime is automatic.`);
                  }
                  const define = (name2, id) => set(state, name2, createImportLazily(state, path2, id, source));
                  define("id/jsx", development ? "jsxDEV" : "jsx");
                  define("id/jsxs", development ? "jsxDEV" : "jsxs");
                  define("id/createElement", "createElement");
                  define("id/fragment", "Fragment");
                  set(state, "defaultPure", source === DEFAULT.importSource);
                } else {
                  throw path2.buildCodeFrameError(`Runtime must be either "classic" or "automatic".`);
                }
                if (development) {
                  path2.traverse(injectMetaPropertiesVisitor, state);
                }
              }
            },
            JSXElement: {
              exit(path2, file2) {
                let callExpr;
                if (get(file2, "runtime") === "classic" || shouldUseCreateElement(path2)) {
                  callExpr = buildCreateElementCall(path2, file2);
                } else {
                  callExpr = buildJSXElementCall(path2, file2);
                }
                path2.replaceWith(_core.types.inherits(callExpr, path2.node));
              }
            },
            JSXFragment: {
              exit(path2, file2) {
                let callExpr;
                if (get(file2, "runtime") === "classic") {
                  callExpr = buildCreateElementFragmentCall(path2, file2);
                } else {
                  callExpr = buildJSXFragmentCall(path2, file2);
                }
                path2.replaceWith(_core.types.inherits(callExpr, path2.node));
              }
            },
            JSXAttribute(path2) {
              if (_core.types.isJSXElement(path2.node.value)) {
                path2.node.value = _core.types.jsxExpressionContainer(path2.node.value);
              }
            }
          }
        };
        function isDerivedClass(classPath) {
          return classPath.node.superClass !== null;
        }
        function isThisAllowed(scope) {
          do {
            const {
              path: path2
            } = scope;
            if (path2.isFunctionParent() && !path2.isArrowFunctionExpression()) {
              if (!path2.isMethod()) {
                return true;
              }
              if (path2.node.kind !== "constructor") {
                return true;
              }
              return !isDerivedClass(path2.parentPath.parentPath);
            }
            if (path2.isTSModuleBlock()) {
              return false;
            }
          } while (scope = scope.parent);
          return true;
        }
        function call(pass, name2, args) {
          const node = _core.types.callExpression(get(pass, `id/${name2}`)(), args);
          if (PURE_ANNOTATION != null ? PURE_ANNOTATION : get(pass, "defaultPure"))
            (0, _helperAnnotateAsPure.default)(node);
          return node;
        }
        function shouldUseCreateElement(path2) {
          const openingPath = path2.get("openingElement");
          const attributes = openingPath.node.attributes;
          let seenPropsSpread = false;
          for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (seenPropsSpread && _core.types.isJSXAttribute(attr) && attr.name.name === "key") {
              return true;
            } else if (_core.types.isJSXSpreadAttribute(attr)) {
              seenPropsSpread = true;
            }
          }
          return false;
        }
        function convertJSXIdentifier(node, parent) {
          if (_core.types.isJSXIdentifier(node)) {
            if (node.name === "this" && _core.types.isReferenced(node, parent)) {
              return _core.types.thisExpression();
            } else if (_core.types.isValidIdentifier(node.name, false)) {
              node.type = "Identifier";
            } else {
              return _core.types.stringLiteral(node.name);
            }
          } else if (_core.types.isJSXMemberExpression(node)) {
            return _core.types.memberExpression(convertJSXIdentifier(node.object, node), convertJSXIdentifier(node.property, node));
          } else if (_core.types.isJSXNamespacedName(node)) {
            return _core.types.stringLiteral(`${node.namespace.name}:${node.name.name}`);
          }
          return node;
        }
        function convertAttributeValue(node) {
          if (_core.types.isJSXExpressionContainer(node)) {
            return node.expression;
          } else {
            return node;
          }
        }
        function accumulateAttribute(array, attribute) {
          if (_core.types.isJSXSpreadAttribute(attribute.node)) {
            const arg = attribute.node.argument;
            if (_core.types.isObjectExpression(arg)) {
              array.push(...arg.properties);
            } else {
              array.push(_core.types.spreadElement(arg));
            }
            return array;
          }
          const value = convertAttributeValue(attribute.node.name.name !== "key" ? attribute.node.value || _core.types.booleanLiteral(true) : attribute.node.value);
          if (attribute.node.name.name === "key" && value === null) {
            throw attribute.buildCodeFrameError('Please provide an explicit key value. Using "key" as a shorthand for "key={true}" is not allowed.');
          }
          if (_core.types.isStringLiteral(value) && !_core.types.isJSXExpressionContainer(attribute.node.value)) {
            var _value$extra;
            value.value = value.value.replace(/\n\s+/g, " ");
            (_value$extra = value.extra) == null ? true : delete _value$extra.raw;
          }
          if (_core.types.isJSXNamespacedName(attribute.node.name)) {
            attribute.node.name = _core.types.stringLiteral(attribute.node.name.namespace.name + ":" + attribute.node.name.name.name);
          } else if (_core.types.isValidIdentifier(attribute.node.name.name, false)) {
            attribute.node.name.type = "Identifier";
          } else {
            attribute.node.name = _core.types.stringLiteral(attribute.node.name.name);
          }
          array.push(_core.types.inherits(_core.types.objectProperty(attribute.node.name, value), attribute.node));
          return array;
        }
        function buildChildrenProperty(children) {
          let childrenNode;
          if (children.length === 1) {
            childrenNode = children[0];
          } else if (children.length > 1) {
            childrenNode = _core.types.arrayExpression(children);
          } else {
            return void 0;
          }
          return _core.types.objectProperty(_core.types.identifier("children"), childrenNode);
        }
        function buildJSXElementCall(path2, file2) {
          const openingPath = path2.get("openingElement");
          const args = [getTag(openingPath)];
          const attribsArray = [];
          const extracted = /* @__PURE__ */ Object.create(null);
          for (const attr of openingPath.get("attributes")) {
            if (attr.isJSXAttribute() && _core.types.isJSXIdentifier(attr.node.name)) {
              const {
                name: name2
              } = attr.node.name;
              switch (name2) {
                case "__source":
                case "__self":
                  if (extracted[name2])
                    throw sourceSelfError(path2, name2);
                case "key": {
                  const keyValue = convertAttributeValue(attr.node.value);
                  if (keyValue === null) {
                    throw attr.buildCodeFrameError('Please provide an explicit key value. Using "key" as a shorthand for "key={true}" is not allowed.');
                  }
                  extracted[name2] = keyValue;
                  break;
                }
                default:
                  attribsArray.push(attr);
              }
            } else {
              attribsArray.push(attr);
            }
          }
          const children = _core.types.react.buildChildren(path2.node);
          let attribs;
          if (attribsArray.length || children.length) {
            attribs = buildJSXOpeningElementAttributes(attribsArray, children);
          } else {
            attribs = _core.types.objectExpression([]);
          }
          args.push(attribs);
          if (development) {
            var _extracted$key, _extracted$__source, _extracted$__self;
            args.push((_extracted$key = extracted.key) != null ? _extracted$key : path2.scope.buildUndefinedNode(), _core.types.booleanLiteral(children.length > 1), (_extracted$__source = extracted.__source) != null ? _extracted$__source : path2.scope.buildUndefinedNode(), (_extracted$__self = extracted.__self) != null ? _extracted$__self : path2.scope.buildUndefinedNode());
          } else if (extracted.key !== void 0) {
            args.push(extracted.key);
          }
          return call(file2, children.length > 1 ? "jsxs" : "jsx", args);
        }
        function buildJSXOpeningElementAttributes(attribs, children) {
          const props = attribs.reduce(accumulateAttribute, []);
          if ((children == null ? void 0 : children.length) > 0) {
            props.push(buildChildrenProperty(children));
          }
          return _core.types.objectExpression(props);
        }
        function buildJSXFragmentCall(path2, file2) {
          const args = [get(file2, "id/fragment")()];
          const children = _core.types.react.buildChildren(path2.node);
          args.push(_core.types.objectExpression(children.length > 0 ? [buildChildrenProperty(children)] : []));
          if (development) {
            args.push(path2.scope.buildUndefinedNode(), _core.types.booleanLiteral(children.length > 1));
          }
          return call(file2, children.length > 1 ? "jsxs" : "jsx", args);
        }
        function buildCreateElementFragmentCall(path2, file2) {
          if (filter && !filter(path2.node, file2))
            return;
          return call(file2, "createElement", [get(file2, "id/fragment")(), _core.types.nullLiteral(), ..._core.types.react.buildChildren(path2.node)]);
        }
        function buildCreateElementCall(path2, file2) {
          const openingPath = path2.get("openingElement");
          return call(file2, "createElement", [getTag(openingPath), buildCreateElementOpeningElementAttributes(file2, path2, openingPath.get("attributes")), ..._core.types.react.buildChildren(path2.node)]);
        }
        function getTag(openingPath) {
          const tagExpr = convertJSXIdentifier(openingPath.node.name, openingPath.node);
          let tagName;
          if (_core.types.isIdentifier(tagExpr)) {
            tagName = tagExpr.name;
          } else if (_core.types.isStringLiteral(tagExpr)) {
            tagName = tagExpr.value;
          }
          if (_core.types.react.isCompatTag(tagName)) {
            return _core.types.stringLiteral(tagName);
          } else {
            return tagExpr;
          }
        }
        function buildCreateElementOpeningElementAttributes(file2, path2, attribs) {
          const runtime = get(file2, "runtime");
          {
            if (runtime !== "automatic") {
              const objs = [];
              const props2 = attribs.reduce(accumulateAttribute, []);
              if (!useSpread) {
                let start = 0;
                props2.forEach((prop, i) => {
                  if (_core.types.isSpreadElement(prop)) {
                    if (i > start) {
                      objs.push(_core.types.objectExpression(props2.slice(start, i)));
                    }
                    objs.push(prop.argument);
                    start = i + 1;
                  }
                });
                if (props2.length > start) {
                  objs.push(_core.types.objectExpression(props2.slice(start)));
                }
              } else if (props2.length) {
                objs.push(_core.types.objectExpression(props2));
              }
              if (!objs.length) {
                return _core.types.nullLiteral();
              }
              if (objs.length === 1) {
                return objs[0];
              }
              if (!_core.types.isObjectExpression(objs[0])) {
                objs.unshift(_core.types.objectExpression([]));
              }
              const helper = useBuiltIns ? _core.types.memberExpression(_core.types.identifier("Object"), _core.types.identifier("assign")) : file2.addHelper("extends");
              return _core.types.callExpression(helper, objs);
            }
          }
          const props = [];
          const found = /* @__PURE__ */ Object.create(null);
          for (const attr of attribs) {
            const name2 = _core.types.isJSXAttribute(attr) && _core.types.isJSXIdentifier(attr.name) && attr.name.name;
            if (runtime === "automatic" && (name2 === "__source" || name2 === "__self")) {
              if (found[name2])
                throw sourceSelfError(path2, name2);
              found[name2] = true;
            }
            accumulateAttribute(props, attr);
          }
          return props.length === 1 && _core.types.isSpreadElement(props[0]) ? props[0].argument : props.length > 0 ? _core.types.objectExpression(props) : _core.types.nullLiteral();
        }
      });
      function getSource(source, importName) {
        switch (importName) {
          case "Fragment":
            return `${source}/${development ? "jsx-dev-runtime" : "jsx-runtime"}`;
          case "jsxDEV":
            return `${source}/jsx-dev-runtime`;
          case "jsx":
          case "jsxs":
            return `${source}/jsx-runtime`;
          case "createElement":
            return source;
        }
      }
      function createImportLazily(pass, path2, importName, source) {
        return () => {
          const actualSource = getSource(source, importName);
          if ((0, _helperModuleImports.isModule)(path2)) {
            let reference = get(pass, `imports/${importName}`);
            if (reference)
              return _core.types.cloneNode(reference);
            reference = (0, _helperModuleImports.addNamed)(path2, importName, actualSource, {
              importedInterop: "uncompiled",
              importPosition: "after"
            });
            set(pass, `imports/${importName}`, reference);
            return reference;
          } else {
            let reference = get(pass, `requires/${actualSource}`);
            if (reference) {
              reference = _core.types.cloneNode(reference);
            } else {
              reference = (0, _helperModuleImports.addNamespace)(path2, actualSource, {
                importedInterop: "uncompiled"
              });
              set(pass, `requires/${actualSource}`, reference);
            }
            return _core.types.memberExpression(reference, _core.types.identifier(importName));
          }
        };
      }
    }
    function toMemberExpression(id) {
      return id.split(".").map((name) => _core.types.identifier(name)).reduce((object, property) => _core.types.memberExpression(object, property));
    }
    function makeSource(path2, state) {
      const location = path2.node.loc;
      if (!location) {
        return path2.scope.buildUndefinedNode();
      }
      if (!state.fileNameIdentifier) {
        const {
          filename = ""
        } = state;
        const fileNameIdentifier = path2.scope.generateUidIdentifier("_jsxFileName");
        const scope = path2.hub.getScope();
        if (scope) {
          scope.push({
            id: fileNameIdentifier,
            init: _core.types.stringLiteral(filename)
          });
        }
        state.fileNameIdentifier = fileNameIdentifier;
      }
      return makeTrace(_core.types.cloneNode(state.fileNameIdentifier), location.start.line, location.start.column);
    }
    function makeTrace(fileNameIdentifier, lineNumber, column0Based) {
      const fileLineLiteral = lineNumber != null ? _core.types.numericLiteral(lineNumber) : _core.types.nullLiteral();
      const fileColumnLiteral = column0Based != null ? _core.types.numericLiteral(column0Based + 1) : _core.types.nullLiteral();
      const fileNameProperty = _core.types.objectProperty(_core.types.identifier("fileName"), fileNameIdentifier);
      const lineNumberProperty = _core.types.objectProperty(_core.types.identifier("lineNumber"), fileLineLiteral);
      const columnNumberProperty = _core.types.objectProperty(_core.types.identifier("columnNumber"), fileColumnLiteral);
      return _core.types.objectExpression([fileNameProperty, lineNumberProperty, columnNumberProperty]);
    }
    function sourceSelfError(path2, name) {
      const pluginName = `transform-react-jsx-${name.slice(2)}`;
      return path2.buildCodeFrameError(`Duplicate ${name} prop found. You are most likely using the deprecated ${pluginName} Babel plugin. Both __source and __self are automatically set when using the automatic runtime. Please remove transform-react-jsx-source and transform-react-jsx-self from your Babel config.`);
    }
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _createPlugin = require_create_plugin();
    var _default = (0, _createPlugin.default)({
      name: "transform-react-jsx",
      development: false
    });
    exports.default = _default;
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/development.js
var require_development = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-jsx@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx/lib/development.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _createPlugin = require_create_plugin();
    var _default = (0, _createPlugin.default)({
      name: "transform-react-jsx/development",
      development: true
    });
    exports.default = _default;
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-jsx-development@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx-development/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-jsx-development@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-jsx-development/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "default", {
      enumerable: true,
      get: function() {
        return _development.default;
      }
    });
    var _development = require_development();
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-display-name@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-display-name/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-display-name@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-display-name/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _helperPluginUtils = require_lib();
    var _path = require("path");
    var _core = require("@babel/core");
    var _default = (0, _helperPluginUtils.declare)((api) => {
      api.assertVersion(7);
      function addDisplayName(id, call) {
        const props = call.arguments[0].properties;
        let safe = true;
        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          if (_core.types.isSpreadElement(prop)) {
            continue;
          }
          const key = _core.types.toComputedKey(prop);
          if (_core.types.isStringLiteral(key, {
            value: "displayName"
          })) {
            safe = false;
            break;
          }
        }
        if (safe) {
          props.unshift(_core.types.objectProperty(_core.types.identifier("displayName"), _core.types.stringLiteral(id)));
        }
      }
      const isCreateClassCallExpression = _core.types.buildMatchMemberExpression("React.createClass");
      const isCreateClassAddon = (callee) => _core.types.isIdentifier(callee, {
        name: "createReactClass"
      });
      function isCreateClass(node) {
        if (!node || !_core.types.isCallExpression(node))
          return false;
        if (!isCreateClassCallExpression(node.callee) && !isCreateClassAddon(node.callee)) {
          return false;
        }
        const args = node.arguments;
        if (args.length !== 1)
          return false;
        const first = args[0];
        if (!_core.types.isObjectExpression(first))
          return false;
        return true;
      }
      return {
        name: "transform-react-display-name",
        visitor: {
          ExportDefaultDeclaration({
            node
          }, state) {
            if (isCreateClass(node.declaration)) {
              const filename = state.filename || "unknown";
              let displayName = _path.basename(filename, _path.extname(filename));
              if (displayName === "index") {
                displayName = _path.basename(_path.dirname(filename));
              }
              addDisplayName(displayName, node.declaration);
            }
          },
          CallExpression(path2) {
            const {
              node
            } = path2;
            if (!isCreateClass(node))
              return;
            let id;
            path2.find(function(path3) {
              if (path3.isAssignmentExpression()) {
                id = path3.node.left;
              } else if (path3.isObjectProperty()) {
                id = path3.node.key;
              } else if (path3.isVariableDeclarator()) {
                id = path3.node.id;
              } else if (path3.isStatement()) {
                return true;
              }
              if (id)
                return true;
            });
            if (!id)
              return;
            if (_core.types.isMemberExpression(id)) {
              id = id.property;
            }
            if (_core.types.isIdentifier(id)) {
              addDisplayName(id.name, node);
            }
          }
        }
      };
    });
    exports.default = _default;
  }
});

// node_modules/.pnpm/@babel+plugin-transform-react-pure-annotations@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-pure-annotations/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/.pnpm/@babel+plugin-transform-react-pure-annotations@7.18.6_@babel+core@7.18.9/node_modules/@babel/plugin-transform-react-pure-annotations/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _helperPluginUtils = require_lib();
    var _helperAnnotateAsPure = require_lib3();
    var _core = require("@babel/core");
    var PURE_CALLS = [["react", /* @__PURE__ */ new Set(["cloneElement", "createContext", "createElement", "createFactory", "createRef", "forwardRef", "isValidElement", "memo", "lazy"])], ["react-dom", /* @__PURE__ */ new Set(["createPortal"])]];
    var _default = (0, _helperPluginUtils.declare)((api) => {
      api.assertVersion(7);
      return {
        name: "transform-react-pure-annotations",
        visitor: {
          CallExpression(path2) {
            if (isReactCall(path2)) {
              (0, _helperAnnotateAsPure.default)(path2);
            }
          }
        }
      };
    });
    exports.default = _default;
    function isReactCall(path2) {
      const calleePath = path2.get("callee");
      if (!calleePath.isMemberExpression()) {
        for (const [module3, methods] of PURE_CALLS) {
          for (const method of methods) {
            if (calleePath.referencesImport(module3, method)) {
              return true;
            }
          }
        }
        return false;
      }
      const object = calleePath.get("object");
      const callee = calleePath.node;
      if (!callee.computed && _core.types.isIdentifier(callee.property)) {
        const propertyName = callee.property.name;
        for (const [module3, methods] of PURE_CALLS) {
          if (object.referencesImport(module3, "default") || object.referencesImport(module3, "*")) {
            return methods.has(propertyName);
          }
        }
      }
      return false;
    }
  }
});

// node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/find-suggestion.js
var require_find_suggestion = __commonJS({
  "node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/find-suggestion.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.findSuggestion = findSuggestion;
    var {
      min
    } = Math;
    function levenshtein(a, b) {
      let t2 = [], u = [], i, j;
      const m = a.length, n = b.length;
      if (!m) {
        return n;
      }
      if (!n) {
        return m;
      }
      for (j = 0; j <= n; j++) {
        t2[j] = j;
      }
      for (i = 1; i <= m; i++) {
        for (u = [i], j = 1; j <= n; j++) {
          u[j] = a[i - 1] === b[j - 1] ? t2[j - 1] : min(t2[j - 1], t2[j], u[j - 1]) + 1;
        }
        t2 = u;
      }
      return u[n];
    }
    function findSuggestion(str, arr) {
      const distances = arr.map((el) => levenshtein(el, str));
      return arr[distances.indexOf(min(...distances))];
    }
  }
});

// node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/validator.js
var require_validator = __commonJS({
  "node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/validator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.OptionValidator = void 0;
    var _findSuggestion = require_find_suggestion();
    var OptionValidator = class {
      constructor(descriptor) {
        this.descriptor = descriptor;
      }
      validateTopLevelOptions(options, TopLevelOptionShape) {
        const validOptionNames = Object.keys(TopLevelOptionShape);
        for (const option of Object.keys(options)) {
          if (!validOptionNames.includes(option)) {
            throw new Error(this.formatMessage(`'${option}' is not a valid top-level option.
- Did you mean '${(0, _findSuggestion.findSuggestion)(option, validOptionNames)}'?`));
          }
        }
      }
      validateBooleanOption(name, value, defaultValue) {
        if (value === void 0) {
          return defaultValue;
        } else {
          this.invariant(typeof value === "boolean", `'${name}' option must be a boolean.`);
        }
        return value;
      }
      validateStringOption(name, value, defaultValue) {
        if (value === void 0) {
          return defaultValue;
        } else {
          this.invariant(typeof value === "string", `'${name}' option must be a string.`);
        }
        return value;
      }
      invariant(condition, message) {
        if (!condition) {
          throw new Error(this.formatMessage(message));
        }
      }
      formatMessage(message) {
        return `${this.descriptor}: ${message}`;
      }
    };
    exports.OptionValidator = OptionValidator;
  }
});

// node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/index.js
var require_lib8 = __commonJS({
  "node_modules/.pnpm/@babel+helper-validator-option@7.18.6/node_modules/@babel/helper-validator-option/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "OptionValidator", {
      enumerable: true,
      get: function() {
        return _validator.OptionValidator;
      }
    });
    Object.defineProperty(exports, "findSuggestion", {
      enumerable: true,
      get: function() {
        return _findSuggestion.findSuggestion;
      }
    });
    var _validator = require_validator();
    var _findSuggestion = require_find_suggestion();
  }
});

// node_modules/.pnpm/@babel+preset-react@7.18.6_@babel+core@7.18.9/node_modules/@babel/preset-react/lib/index.js
var require_lib9 = __commonJS({
  "node_modules/.pnpm/@babel+preset-react@7.18.6_@babel+core@7.18.9/node_modules/@babel/preset-react/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var helperPluginUtils = require_lib();
    var transformReactJSX = require_lib4();
    var transformReactJSXDevelopment = require_lib5();
    var transformReactDisplayName = require_lib6();
    var transformReactPure = require_lib7();
    var helperValidatorOption = require_lib8();
    function _interopDefaultLegacy(e) {
      return e && typeof e === "object" && "default" in e ? e : { "default": e };
    }
    var transformReactJSX__default = /* @__PURE__ */ _interopDefaultLegacy(transformReactJSX);
    var transformReactJSXDevelopment__default = /* @__PURE__ */ _interopDefaultLegacy(transformReactJSXDevelopment);
    var transformReactDisplayName__default = /* @__PURE__ */ _interopDefaultLegacy(transformReactDisplayName);
    var transformReactPure__default = /* @__PURE__ */ _interopDefaultLegacy(transformReactPure);
    new helperValidatorOption.OptionValidator("@babel/preset-react");
    function normalizeOptions(options = {}) {
      {
        let {
          pragma,
          pragmaFrag
        } = options;
        const {
          pure,
          throwIfNamespace = true,
          runtime = "classic",
          importSource,
          useBuiltIns,
          useSpread
        } = options;
        if (runtime === "classic") {
          pragma = pragma || "React.createElement";
          pragmaFrag = pragmaFrag || "React.Fragment";
        }
        const development = !!options.development;
        return {
          development,
          importSource,
          pragma,
          pragmaFrag,
          pure,
          runtime,
          throwIfNamespace,
          useBuiltIns,
          useSpread
        };
      }
    }
    var index = helperPluginUtils.declarePreset((api, opts) => {
      api.assertVersion(7);
      const {
        development,
        importSource,
        pragma,
        pragmaFrag,
        pure,
        runtime,
        throwIfNamespace
      } = normalizeOptions(opts);
      return {
        plugins: [[development ? transformReactJSXDevelopment__default["default"] : transformReactJSX__default["default"], {
          importSource,
          pragma,
          pragmaFrag,
          runtime,
          throwIfNamespace,
          pure,
          useBuiltIns: !!opts.useBuiltIns,
          useSpread: opts.useSpread
        }], transformReactDisplayName__default["default"], pure !== false && transformReactPure__default["default"]].filter(Boolean)
      };
    });
    exports["default"] = index;
  }
});

// src/generate.ts
var import_promises2 = __toESM(require("fs/promises"));

// src/index.ts
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
      const [declarationPath] = program2.unshiftContainer("body", declaration2);
      declarationPath.addComment("leading", ` ${pagePath} variables `);
      configPath.traverse(traverseReferenced(program2, declarationPath));
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
    import_glob.default.sync("./pages/**/!(_)*.tsx").map(async (path2) => {
      const code = await import_promises.default.readFile(path2, {
        encoding: "utf-8"
      });
      return {
        path: path2,
        ast: (0, import_parser.parse)(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"]
        })
      };
    })
  );
  const program2 = t.program([]);
  (0, import_traverse.default)(t.file(program2), {
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
      path2.unshiftContainer(
        "body",
        t.importDeclaration(
          [
            t.importDefaultSpecifier(
              t.identifier("React")
            )
          ],
          t.stringLiteral("react")
        )
      );
      for (const page of pages) {
        (0, import_traverse.default)(page.ast, pageVisitor(page.path, path2, configsArray));
      }
    }
  });
  return (0, import_generator.default)(program2);
}

// src/generate.ts
var import_path = __toESM(require("path"));
var import_core = require("@babel/core");
var import_preset_react = __toESM(require_lib9());
async function generate() {
  const { code } = await getPagesConfig();
  const js = (0, import_core.transform)(code, {
    presets: [import_preset_react.default]
  });
  const dirs = [
    import_path.default.resolve(__dirname, "../", ".generate"),
    import_path.default.resolve(__dirname, "../", "node_modules", "next-pages-config", ".generate")
  ];
  for (const dir of dirs) {
    await import_promises2.default.mkdir(dir, { recursive: true });
    await import_promises2.default.writeFile(import_path.default.join(dir, "data.mjs"), js == null ? void 0 : js.code, { encoding: "utf-8" });
  }
}
generate();
