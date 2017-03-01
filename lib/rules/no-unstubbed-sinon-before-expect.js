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
        var setStub = false;
        var restoredStub = false;
        var failureMessage = 'Call `stub.restore()` before `expect`';

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        // any helper functions should go here or else delete this section
      function isTestBlock(type) {
        return ['ArrowFunctionExpression'].includes(type);
      }

      function checkForSetStub(variableDeclarer) {
        if (variableDeclarer.init.type == 'CallExpression' &&
             variableDeclarer.init.callee &&
             variableDeclarer.init.callee.object &&
             variableDeclarer.init.callee.object.name === 'sinon' &&
             variableDeclarer.init.callee.property.name === 'stub'
            ) {
              setStub = true;
            }
      }

      function checkForExpect(expressionNode) {
        if(expressionNode.type === 'ExpressionStatement') {
          if (setStub && !restoredStub) {
            return context.report({
              node: expressionNode.expression,
              message: failureMessage,
            });
          }
        }
      }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
          ExpressionStatement: function(node) {
            if (!node.expression) { return }
            var callee = node.expression.callee;
            // if (!callee.name === 'it') { return }
            if (callee.name === 'it') { // smells like mocha
              var expressionArgs = node.expression.arguments;
              expressionArgs.forEach(function(arg) {
                if(isTestBlock(arg.type)) {
                  var bodyNode = arg.body;
                  // steps through all of the it block
                  bodyNode.body.forEach(function(innerBodyNode) {
                    if (innerBodyNode.type === 'VariableDeclaration') {
                      // look at all declarations
                      innerBodyNode.declarations.forEach(function(variableDeclarer) {
                        checkForSetStub(variableDeclarer);
                      });
                    }
                    else if (innerBodyNode.type == 'ExpressionStatement' &&
                      innerBodyNode.expression && innerBodyNode.expression.callee
                      && innerBodyNode.expression.callee.property.name === 'restore'
                    ) {
                      restoredStub = true;
                    }
                    else if(innerBodyNode.type == 'ExpressionStatement') {
                      checkForExpect(innerBodyNode);
                    }
                  });
                }
              });
            }
          }
        };
    }
};
