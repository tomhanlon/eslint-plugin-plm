/**
 * @fileoverview Make sure you cleanup your stubs and spies before your
 * expectations! Otherwise you can pollute the whole module if you stubbed/spied
 * on an es2015 import. Only works with mocha
 * @author Evan Lloyd
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: "no",
      category: "Fill me in",
      recommended: false
    },
    fixable: null,  // or "code" or "whitespace"
    schema: [
      // fill in your schema
    ]
  },

  create: function(context) {

    // variables should be defined here
    const DANGEROUS_SINON_METHODS = ['spy', 'stub'];
    let setStub = false;
    let restoredStub = false;

    // store the spies & stubs in an obj so this rule can deal with multiple
    // instances in a single test,
    // keys are the variable name that the sinon object is assigned to, the
    // value is true if spy or stub has been set OR 'restored' if it has been restored
    let dangerousSinonInstances = {};

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function failureMessage(mockName) {
      return `Call '${mockName}.restore()' before 'expect'`;
    }

    function isTestBlock(type) {
      return ['ArrowFunctionExpression', 'FunctionExpression'].includes(type);
    }

    function recordSinonInstance(variableDeclarer) {
      if (variableDeclarer.init.type == 'CallExpression' &&
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
        node.expression.callee.object.object.callee.name === 'expect'
    }

    function hasNotUnstubbed() {
      return setStub && !restoredStub;
    }

    function verifyAllRestored(node) {
      for (let mockName in dangerousSinonInstances) {
        const methodName = dangerousSinonInstances[mockName];
        if (methodName !== 'restored') {
          const errorData = { node, mockName, methodName };
          reportError(errorData);
        }
      }
    }

    function reportError({node, mockName, methodName}) {
      return context.report({
        node: node.expression,
        message: failureMessage(mockName),
      });
    }

    function verifyUnstubbedBeforeExpect(expressionNode) {
      if(nodeHasExpect(expressionNode)) {
        verifyAllRestored(expressionNode);
      }
    }

    function isStubRestore(node) {
      return node.type == 'ExpressionStatement' && node.expression
        && node.expression.callee &&
        node.expression.callee.property &&
        node.expression.callee.property.name === 'restore';
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ExpressionStatement: function(node) {
        if (!node.expression) { return };
        let callee = node.expression.callee;
        if (!callee) { return };
        if (callee.name !== 'it') { return };

        let expressionArgs = node.expression.arguments;

        expressionArgs.forEach(function(arg) {
          if(isTestBlock(arg.type)) {
            let bodyNode = arg.body;

            bodyNode.body.forEach(function(innerBodyNode) {
              if (innerBodyNode.type === 'VariableDeclaration') {
                innerBodyNode.declarations.forEach(function(variableDeclarer) {
                  recordSinonInstance(variableDeclarer);
                });
              }
              else if (isStubRestore(innerBodyNode)) {
                dangerousSinonInstances[innerBodyNode.expression.callee.object.name] = 'restored';
              }
              // check for restore or unstub inside a return statment
              // like when the test returns a promise
              else if (innerBodyNode.type == 'ReturnStatement' &&
                innerBodyNode.argument && innerBodyNode.argument.arguments) {
                  const returnBody = innerBodyNode.argument.arguments;

                  returnBody.forEach((returnNode) => {
                    if (returnNode.body && returnNode.body.body) {
                      returnNode.body.body.forEach((returnExpression) => {
                        if (isStubRestore(returnExpression)) {
                          dangerousSinonInstances[returnExpression.expression.callee.object.name] = 'restored';
                        }
                        else {
                          (verifyUnstubbedBeforeExpect(returnExpression));
                        }
                      })
                    }
                  });
                }
              else if (innerBodyNode.type == 'ExpressionStatement') {
                verifyUnstubbedBeforeExpect(innerBodyNode);
              }
            });
          }
        });
      }
    };
  }
};
