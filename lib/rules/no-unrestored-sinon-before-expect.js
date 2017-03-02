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

    function reportError({ node, mockName }) {
      return context.report({
        node: node.expression,
        message: failureMessage(mockName),
      });
    }

    function verifyAllRestored(node) {
      for (const mockName in dangerousSinonInstances) {
        if ({}.hasOwnProperty.call(dangerousSinonInstances, mockName)) {
          const methodName = dangerousSinonInstances[mockName];
          if (methodName !== 'restored') {
            const errorData = { node, mockName };
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

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ExpressionStatement: (node) => {
        if (!node.expression) { return; }
        const callee = node.expression.callee;
        if (!callee) { return; }
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
