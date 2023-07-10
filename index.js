#!/usr/bin/env node

const cloner = require('@jestaubach/cloner-git');
const git = cloner.use(cloner.default);
const { readFile } = require('fs/promises');
const { resolve } = require('path');

// Suppress experimental warning; can't believe this worked first try.
// Credit where due: https://stackoverflow.com/questions/55778283/how-to-disable-warnings-when-node-is-launched-via-a-global-shell-script
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === `warning` &&
    typeof data === `object` &&
    data.name === `ExperimentalWarning`
  ) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};

// This gets called by the python code since subprocess not available in pyodide
const cloner_git = {
  lsFiles: async (path) => {
    const { error, stdout, stderr } = await git(['ls-files']);
    return stdout;
  },
  diffNameOnly: async (path) => {
    // Todo: This is not called 
    // const { error, stdout, stderr } = await git(['diff', '--name-only']);
    // return stdout;
    return '';
  },
  revParse: async () => {
    // Todo: This is not called
    // const { error, stdout, stderr } = await git(['rev-parse', '--show-toplevel']);
    // return stdout;
    return '';
  },
}

const { loadPyodide } = require("pyodide");

(async () => {
  async function contents(path) {
    return await readFile(path, 'utf8');
  }

  async function run_python(python_script) {
    let saveConsoleLog = console.log;
    console.log = () => { };
    let pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("detect-secrets");
    pyodide.FS.mkdir("/local_directory");
    pyodide.FS.mount(pyodide.FS.filesystems.NODEFS, { root: "./" }, "/local_directory");
    pyodide.registerJsModule("cloner_git", cloner_git);
    console.log = saveConsoleLog;
    const text = await contents(resolve(__dirname, python_script));
    return pyodide.runPythonAsync(text);
  }

  await run_python('index.py');
})();
