/**
 * @fileoverview tests for no-unrestored-sinon-before-expect
 * @author Evan Lloyd
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-unrestored-sinon-before-expect');
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run('no-unrestored-sinon-before-expect', rule, {

  valid: [
    {
      code: `it("passes with unstub before expect", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).to.equal(true);
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `it("passes with a promise", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        const promise = Promise.resolve(ajaxStub);
        return Promise.all(promise).then(() => {
          ajaxStub.restore();
          expect(true).to.equal(true);
        })
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `it("passes with unstub before expect", function() {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).to.equal(true);
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `it("passes when spy is restored before expect", () => {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post', ajaxCallBack);
        ajaxSpy.restore();
        expect(true).to.equal(true);
      });`,
      globals: ['it'],
      parserOptions: { ecmaVersion: 6 },
    },
  ],

  invalid: [
    {
      code: `it("should fail if a single stub is not restored", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        expect(true).to.equal(true);
        ajaxStub.restore();
      });`,
      parserOptions: { ecmaVersion: 6 },
      globals: ['it'],
      errors: [{
        message: "Call 'ajaxStub.restore()' before 'expect'",
        type: 'CallExpression',
      }],
    },
    {
      code: `it("should fail if a stub is not restored in a promise", () => {
        const ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        const promise = Promise.resolve(ajaxStub);
        return Promise.all(promise).then(() => {
          expect(true).to.equal(true);
          ajaxStub.restore();
        })
      });`,
      parserOptions: { ecmaVersion: 6 },
      globals: ['it'],
      errors: [{
        message: "Call 'ajaxStub.restore()' before 'expect'",
        type: 'CallExpression',
      }],
    },
    {
      code: `it("should fail if a spy is not restored", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post', ajaxCallBack);
        expect(true).to.equal(true);
        ajaxSpy.restore();
      });`,
      parserOptions: { ecmaVersion: 6 },
      globals: ['it'],
      errors: [{
        message: "Call 'ajaxSpy.restore()' before 'expect'",
        type: 'CallExpression',
      }],
    },
    {
      code: `it("should report multiple violations in a test", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post');
        var someStub = sinon.stub(SomeHelper, 'method', callback);
        expect(true).to.equal(true);
        ajaxSpy.restore();
        someStub.restore();
      });`,
      parserOptions: { ecmaVersion: 6 },
      globals: ['it'],
      errors: [
        {
          message: "Call 'ajaxSpy.restore()' before 'expect'",
          type: 'CallExpression',
        },
        {
          message: "Call 'someStub.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
    {
      code: `it("should report a single violation when multiple stubs in a test", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post');
        var anotherSpy = sinon.spy(SomeHelper, 'method');
        anotherSpy.restore();
        expect(true).to.equal(true);
        ajaxSpy.restore();
      });`,
      parserOptions: { ecmaVersion: 6 },
      globals: ['it'],
      errors: [
        {
          message: "Call 'ajaxSpy.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
  ],
});
