# eslint-plugin-plm
PLM eslint rules

A set of eslint rules for plm javascript projects.

## Installation

This project uses [yarn](https://yarnpkg.com/en/docs/install#mac-tab), but any
`yarn` commands can be replaced with `npm`.

Dev install
```
  git clone git@github.com:patientslikeme/eslint-plugin-plm.git
  cd eslint-plugin-plm
  yarn install
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-plm` globally.

## Usage

Run `npm install --save-dev eslint-plugin-plm` in your js project.
Add `plm` to the plugins section of your `.eslintrc` configuration file.
You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "plm"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "plm/rule-name": 2
    }
}
```

## Supported Rules

See `lib/rules/`

## Adding a Rule

This project uses [yeoman](http://yeoman.io/). To add a new rule:

```
  yarn generate:rule
```

Make sure all tests are passing: `yarn run test`.

For more details on writing rules, see [this post](https://medium.com/@btegelund/creating-an-eslint-plugin-87f1cb42767f) and the [official docs](http://eslint.org/docs/developer-guide/working-with-rules).

Copy and paste the tests cases for your rule into [AST explorer](https://astexplorer.net/) to make life easier.
