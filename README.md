# eslint-plugin-plm
PLM eslint rules

A set of eslint rules for plm javascript projects.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-plm`:

```
$ npm install eslint-plugin-plm
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-plm` globally.

## Usage

Add `plm` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

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

This project uses yoeman http://yeoman.io/. To add a new rule:

```
  # install dependencies
  npm install -g yo
  npm i -g generator-eslint

  # in the eslint-plugin-plm directory run
  yo eslint:rule
```

Make sure all tests are passing: `npm run test`.

For more details on writing rules, see

https://medium.com/@btegelund/creating-an-eslint-plugin-87f1cb42767f

Copy and paste the tests cases for your rule into AST explorer to make life easier: https://astexplorer.net/
