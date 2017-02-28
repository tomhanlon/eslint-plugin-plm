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
    `const ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
       ajaxStub.restore();
       expect(true).toEqual('cat');`,
  ],

  invalid: [
    {
      code: `const ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
            expect(true).toEqual('cat');
            ajaxStub.restore();`,
      errors: [{
        message: "Restore stubs before `expect`",
        type: "Otherwise terrible things will happen"
      }]
    }
  ]
});
