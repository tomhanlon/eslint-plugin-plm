/**
 * @fileoverview no
 * @author Evan Lloyd
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-unstubbed-sinon-before-expect"),

  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-unstubbed-sinon-before-expect", rule, {

  valid: [
    {
      code:`it("passes with unstub before expect", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).toEqual('cat');
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6  },
    },
    {
      code:`it("passes with a promise", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        const promise = Promise.resolve(ajaxStub);
        return Promise.all(promise).then(() => {
          ajaxStub.restore();
          expect(true).toEqual('cat');
        })
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6  },
    },
    {
      code:`it("passes with unstub before expect", function() {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).toEqual('cat');
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6  },
    },
  ],

  invalid: [
    {
      code:`it("should fail", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        expect(true).toEqual('cat');
        ajaxStub.restore();
      });`,
      parserOptions: { ecmaVersion: 6  },
      globals: ['it'],
      errors: [{
        message: "Call `stub.restore()` before `expect`",
        type: "CallExpression",
      }]
    },
    {
      code:`it("should fail", () => {
        const ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        const promise = Promise.resolve(ajaxStub);
        return Promise.all(promise).then(() => {
          expect(true).toEqual('cat');
          ajaxStub.restore();
        })
      });`,
      parserOptions: { ecmaVersion: 6  },
      globals: ['it'],
      errors: [{
        message: "Call `stub.restore()` before `expect`",
        type: "CallExpression",
      }]
    },
    {
      code:`it("should fail", function() {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        expect(true).toEqual('cat');
        ajaxStub.restore();
      });`,
      parserOptions: { ecmaVersion: 6  },
      globals: ['it'],
      errors: [{
        message: "Call `stub.restore()` before `expect`",
        type: "CallExpression",
      }]
    },
  ]
});
