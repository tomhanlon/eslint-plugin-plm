/**
 * @fileoverview no
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
    const failureMessage = 'Call `stub.restore()` before `expect`';

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function isTestBlock(type) {
      return ['ArrowFunctionExpression', 'FunctionExpression'].includes(type);
    }

    function isStubDeclared(variableDeclarer) {
      if (variableDeclarer.init.type == 'CallExpression' &&
        variableDeclarer.init.callee &&
        variableDeclarer.init.callee.object &&
        variableDeclarer.init.callee.object.name === 'sinon' &&
        DANGEROUS_SINON_METHODS.includes(variableDeclarer.init.callee.property.name)
      ) {
        setStub = true;
      }
    }

    function nodeHasExpect(node) {
      return node.type === 'ExpressionStatement' && node.expression &&
        node.expression.callee && node.expression.callee.object
        && node.expression.callee.object.callee.name === 'expect'
    }

    function hasNotUnstubbed() {
      return setStub && !restoredStub;
    }

    function reportError(node) {
      return context.report({
        node: node.expression,
        message: failureMessage,
      });
    }

    function verifyUnstubbedBeforeExpect(expressionNode) {
      if(nodeHasExpect(expressionNode) && hasNotUnstubbed()) {
        return reportError(expressionNode);
      }
    }

    function isStubRestore(node) {
      return node.type == 'ExpressionStatement' && node.expression
        && node.expression.callee && node.expression.callee.property.name === 'restore';
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ExpressionStatement: function(node) {
        if (!node.expression) { return }
        let callee = node.expression.callee;
        if (callee.name === 'it') { // smells like mocha
          let expressionArgs = node.expression.arguments;
          expressionArgs.forEach(function(arg) {
            if(isTestBlock(arg.type)) {
              let bodyNode = arg.body;
              bodyNode.body.forEach(function(innerBodyNode) {
                if (innerBodyNode.type === 'VariableDeclaration') {
                  innerBodyNode.declarations.forEach(function(variableDeclarer) {
                    isStubDeclared(variableDeclarer);
                  });
                }
                else if (isStubRestore(innerBodyNode)) {
                  restoredStub = true;
                }
                // check for restore or unstub inside a promise
                else if (innerBodyNode.type == 'ReturnStatement'
                  && innerBodyNode.argument
                  && innerBodyNode.argument.arguments
                ) {
                  const returnBody = innerBodyNode.argument.arguments;
                  returnBody.forEach((returnNode) => {
                    if (returnNode.body && returnNode.body.body) {
                      returnNode.body.body.forEach((returnExpression) => {
                        if (isStubRestore(returnExpression)) {
                          restoredStub = true;
                        }
                        else {
                          (verifyUnstubbedBeforeExpect(returnExpression));
                        }
                      })
                    }
                  });
                }
                else if(innerBodyNode.type == 'ExpressionStatement') {
                  verifyUnstubbedBeforeExpect(innerBodyNode);
                }
              });
            }
          });
        }
      }
    };
  }
};
