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
    {
      code:`it("passes when spy is restored before expect", () => {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post', ajaxCallBack);
        ajaxSpy.restore();
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
    {
      code:`it("should fail on an unrestored spy", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post');
        expect(true).toEqual('cat');
        ajaxSpy.restore();
      });`,
      parserOptions: { ecmaVersion: 6  },
      globals: ['it'],
      errors: [{
        message: "Call `stub.restore()` before `expect`",
        type: "CallExpression",
      }]
    },
    {
      code:`it("should report multiple violations in a test", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post');
        var someStub = sinon.stub(SomeHelper, 'method', callback);
        expect(true).toEqual('cat');
        ajaxSpy.restore();
      });`,
      parserOptions: { ecmaVersion: 6  },
      globals: ['it'],
      errors: [
        {
          message: "Call `stub.restore()` before `expect`",
          type: "CallExpression",
        },
        {
          message: "Call `stub.restore()` before `expect`",
          type: "CallExpression",
        }
      ]
    },
  ]
});
