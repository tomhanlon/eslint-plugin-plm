/**
 * @fileoverview Make sure you cleanup your stubs and spies before your
 * expectations! Otherwise you can pollute the whole module if you stubbed/spied
 * on an es2015 import. Only works with mocha
 * @author Evan Lloyd
 */
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'no',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: null,  // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ],
  },

  create: (context) => {
    // variables should be defined here
    const DANGEROUS_SINON_METHODS = ['spy', 'stub'];
    // store the spies & stubs in an obj so this rule can deal with multiple
    // instances in a single test,
    // keys are the variable name that the sinon object is assigned to, the
    // value is true if spy or stub has been set OR 'restored' if it has been restored
    const dangerousSinonInstances = {};

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function isReturnStatement(node) {
      return node.type === 'ReturnStatement' && node.argument
        && node.argument.arguments;
    }

    function failureMessage(mockName) {
      return `Call '${mockName}.restore()' before 'expect'`;
    }

    function isTestBlock(type) {
      return ['ArrowFunctionExpression', 'FunctionExpression'].includes(type);
    }

    function recordSinonInstance(variableDeclarer) {
      if (variableDeclarer.init.type === 'CallExpression' &&
        variableDeclarer.init.callee &&
        variableDeclarer.init.callee.object &&
        variableDeclarer.init.callee.object.name === 'sinon' &&
        variableDeclarer.init.arguments &&
        variableDeclarer.init.arguments.length &&
        DANGEROUS_SINON_METHODS.includes(variableDeclarer.init.callee.property.name)
      ) {
        dangerousSinonInstances[variableDeclarer.id.name] = true;
      }
    }

    function nodeHasExpect(node) {
      return node.type === 'ExpressionStatement' && node.expression &&
        node.expression.callee && node.expression.callee.object &&
        node.expression.callee.object.object &&
        node.expression.callee.object.object.callee &&
        node.expression.callee.object.object.callee.name === 'expect';
    }

    function reportError({ node, mockName, hook }) {
      let message;
      if (hook) {
        message = `Call '${mockName}.restore()' in an 'afterEach' block`;
      } else {
        message = failureMessage(mockName);
      }
      return context.report({
        node: node.expression,
        message,
      });
    }

    function verifyAllRestored(node, hook = false) {
      for (const mockName in dangerousSinonInstances) {
        if ({}.hasOwnProperty.call(dangerousSinonInstances, mockName)) {
          const methodName = dangerousSinonInstances[mockName];
          if (methodName !== 'restored') {
            delete dangerousSinonInstances[mockName];
            const errorData = { node, mockName, hook };
            reportError(errorData);
          }
        }
      }
    }

    function verifyUnstubbedBeforeExpect(expressionNode) {
      if (nodeHasExpect(expressionNode)) {
        verifyAllRestored(expressionNode);
      }
    }

    function isStubRestore(node) {
      return node.type === 'ExpressionStatement' && node.expression
        && node.expression.callee &&
        node.expression.callee.property &&
        node.expression.callee.property.name === 'restore';
    }

    function checkForSinonRestore(node) {
      if (node.body && node.body.body && node.body.body.length) {
        const bodyExpressions = node.body.body;
        bodyExpressions.forEach((expression) => {
          if (expression.type === 'ExpressionStatement' && expression.expression
            && expression.expression.callee && expression.expression.callee.object &&
            expression.expression.callee.property && expression.expression.callee.property.name === 'restore'
          ) {
            const sinonVariable = expression.expression.callee.object.name;
            dangerousSinonInstances[sinonVariable] = 'restored';
          }
        });
      }
      const fakeNode = { expression: node };
      return verifyAllRestored(fakeNode, true);
    }

    function recordSinonAssignment(node) {
      // this is different from recordSinonInstance because the variable here
      // was already declared outside of the scope of the beforeEach/afterEach
      // block
      if (node.body && node.body.body && node.body.body.length && node.body.body) {
        node.body.body.forEach((expressionNode) => {
          if (!expressionNode.expression && !expressionNode.expression.right
            && !expressionNode.expression.right.callee && !expressionNode.expression.right.callee.property) { return; }
          const expression = expressionNode.expression;

          const sinonMethod = expression.right.callee.property.name;
          const variableBoundToSinonInstance = expression.left.name;
          if (DANGEROUS_SINON_METHODS.includes(sinonMethod)) {
            dangerousSinonInstances[variableBoundToSinonInstance] = true;
          }
        });
      }
    }

    function lintHooks({ args, hookName }) {
      args.forEach((arg) => {
        // see if it is a set or restore,
        if (hookName === 'beforeEach') {
          recordSinonAssignment(arg);
        } else if (hookName === 'afterEach') {
          checkForSinonRestore(arg);
        }
      });
    }

    function lintTestHookExpression(bodyBlockNode) {
      if (bodyBlockNode.type !== 'ExpressionStatement') { return; }
      const hookMethods = ['beforeEach', 'afterEach'];
      if (bodyBlockNode.expression && bodyBlockNode.expression.callee
        && hookMethods.includes(bodyBlockNode.expression.callee.name)) {
        lintHooks({ args: bodyBlockNode.expression.arguments, hookName: bodyBlockNode.expression.callee.name });
      }
    }

    function lintDescribeBlock(expressionArgs) {
      expressionArgs.forEach((arg) => {
        if (!isTestBlock(arg.type)) { return; }
        const expressionArg = arg.body;
        if (!expressionArg.body.type === 'BlockStatement') { return; }
        const blockBody = expressionArg.body; // this is an array of statements/expressions
        blockBody.forEach((blockStatement) => {
          if (blockStatement.type === 'ExpressionStatement') {
            lintTestHookExpression(blockStatement);
          }
        });
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ExpressionStatement: (node) => {
        if (!node.expression) { return; }
        const callee = node.expression.callee;
        if (!callee) { return; }
        if (callee.name === 'describe') { lintDescribeBlock(node.expression.arguments); }
        if (callee.name !== 'it') { return; }

        const expressionArgs = node.expression.arguments;

        expressionArgs.forEach((arg) => {
          if (isTestBlock(arg.type)) {
            const bodyNode = arg.body;

            bodyNode.body.forEach((innerBodyNode) => {
              if (innerBodyNode.type === 'VariableDeclaration') {
                innerBodyNode.declarations.forEach((variableDeclarer) => {
                  recordSinonInstance(variableDeclarer);
                });
              } else if (isStubRestore(innerBodyNode)) {
                dangerousSinonInstances[innerBodyNode.expression.callee.object.name] = 'restored';
              } else if (isReturnStatement(innerBodyNode)) {
                const returnBody = innerBodyNode.argument.arguments;
                returnBody.forEach((returnNode) => {
                  if (returnNode.body && returnNode.body.body) {
                    returnNode.body.body.forEach((returnExpression) => {
                      if (isStubRestore(returnExpression)) {
                        dangerousSinonInstances[returnExpression.expression.callee.object.name] = 'restored';
                      } else {
                        (verifyUnstubbedBeforeExpect(returnExpression));
                      }
                    });
                  }
                });
              } else if (innerBodyNode.type === 'ExpressionStatement') {
                verifyUnstubbedBeforeExpect(innerBodyNode);
              }
            });
          }
        });
      },
    };
  },
};
