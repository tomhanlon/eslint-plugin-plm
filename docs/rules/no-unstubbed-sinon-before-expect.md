# no-unrestored-sinon-before-expect

Please describe the origin of the rule here.


## Rule Details

This rule aims to stop you from using `sinon.spy` or `sinon.mock` an es6 import
and forgetting to `restore` the original behavior at the end of your test,
which results in leaving the spy/stub as a global and polluting the rest of the
test suite.

Examples of **incorrect** code for this rule:

```js
it("should fail", () => {
  let ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
  expect(true).toEqual('cat');
  ajaxStub.restore();
});
```

Examples of **correct** code for this rule:

```js
it("passes with unstub before expect", () => {
  let ajaxStub = sinon.stub(AjaxHelpers, 'post', ajaxCallBack);
  ajaxStub.restore();
  expect(true).toEqual('cat');
});
```
