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

const parserOptions = { ecmaVersion: 6 };
const ruleTester = new RuleTester();
ruleTester.run('no-unrestored-sinon-before-expect', rule, {

  valid: [
    {
      code: `it("passes with unstub before expect", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).to.equal(true);
      });`,
      parserOptions,
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
      parserOptions,
    },
    {
      code: `it("passes with unstub before expect", function() {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        ajaxStub.restore();
        expect(true).to.equal(true);
      });`,
      parserOptions,
    },
    {
      code: `it("passes when spy is restored before expect", () => {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post', ajaxCallBack);
        ajaxSpy.restore();
        expect(true).to.equal(true);
      });`,
      parserOptions,
    },
    {
      code: `it("should ignore naked spies", function() {
        var ajaxSpy = sinon.spy();
        ajaxSpy();
        expect(ajaxSpy.callCount).to.equal(1);
      });`,
      parserOptions,
    },
    {
      code: `it("should ignore naked stubs", function() {
        var someStub = sinon.stub();
        someStub();
        expect(someStub.callCount).to.equal(1);
      });`,
      parserOptions,
    },
    {
      code: `describe("passing case with before/after hooks", function() {
        let spy;
        beforeEach(() => {
          spy = sinon.spy(someHelper, 'someMethod');
        });
        afterEach(() => {
          spy.restore();
        });
      });`,
      parserOptions,
    },
    {
      code: `describe("passes with hooks and it block", function() {
        let spy;
        beforeEach(() => {
          spy = sinon.spy(someHelper, 'someMethod');
        });
        afterEach(() => {
          spy.restore();
        });
        it("passes", () => {
          const stub = sinon.stub(helper, 'method');
          stub();
          stub.restore();
          expect(stub.called).to.equal(true);
        })
      });`,
      parserOptions,
    },
  ],

  invalid: [
    {
      code: `it("should fail if a single stub is not restored", () => {
        var ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
        expect(true).to.equal(true);
        ajaxStub.restore();
      });`,
      parserOptions,
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
      parserOptions,
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
      parserOptions,
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
      parserOptions,
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
      parserOptions,
      errors: [
        {
          message: "Call 'ajaxSpy.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
    {
      code: `describe("failing case with before/after hooks", function() {
        let spy;
        beforeEach(() => {
          spy = sinon.spy(someHelper, 'someMethod');
        });
        afterEach(() => {
        });
      });`,
      parserOptions,
      errors: [
        {
          message: "Call 'spy.restore()' in an 'afterEach' block",
          type: 'ArrowFunctionExpression',
        },
      ],
    },
    {
      code: `it("should report a single once when a test has multiple expects", function() {
        var ajaxSpy = sinon.spy(AjaxHelpers, 'post');
        var anotherSpy = sinon.spy(SomeHelper, 'method');
        anotherSpy.restore();
        expect(true).to.equal(true);
        expect(true).to.equal(true);
        expect(true).to.equal(true);
        expect(true).to.equal(true);
        ajaxSpy.restore();
      });`,
      parserOptions,
      errors: [
        {
          message: "Call 'ajaxSpy.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
    {
      code: `describe("it should report from hooks and it blocks", function() {
        let spy;
        beforeEach(() => {
          spy = sinon.spy(someHelper, 'someMethod');
        });
        afterEach(() => {
        });
        it("fails here too", () => {
          const stub = sinon.stub(myHelper, 'someMethod');
          expect(stub.callCount).to.equal(1);
        });
      });`,
      parserOptions,
      errors: [
        {
          message: "Call 'spy.restore()' in an 'afterEach' block",
          type: 'ArrowFunctionExpression',
        },
        {
          message: "Call 'stub.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
    {
      code: `describe("it should report when sinon.callsFake is used", function() {
        it("fails here too", () => {
          const helperStub = sinon.stub(myHelper, 'someMethod').callsFake(() => {});
          expect(stub.callCount).to.equal(1);
        });
      });`,
      parserOptions,
      errors: [
        {
          message: "Call 'helperStub.restore()' before 'expect'",
          type: 'CallExpression',
        },
      ],
    },
  ],
});
