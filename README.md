# eslint-plugin-plm
PLM eslint rules

A set of eslint rules for plm javascript projects.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-sinon-no-unrestored-stubs`:

```
$ npm install eslint-plugin-sinon-no-unrestored-stubs --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-sinon-no-unrestored-stubs` globally.

## Usage

Add `sinon-no-unrestored-stubs` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "sinon-no-unrestored-stubs"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "sinon-no-unrestored-stubs/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here
