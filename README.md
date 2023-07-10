# detect-secrets

The project yelp/detect-secrets is written in Python but is useful for projects in other languages.

However, it would be nice not to have to install and maintain python in the development envioronment for the sake of one tool.

There does exist a containerized environment that can be used to run detect-secrets. However, maintaining docker int he development environment is probably an even bigger headache.

So this is a somewhat successful exploration of using Pyodide in order to run python code from javascript.

What works:

- basic scanning appears to be working

What doesn't work:

- multiprocessing is not supported in Pyodide therefore it is likely to take a significant performance hit.
- subprocesses is not supported in Pyodide therefore calls to git to retrieve the list of tracked files needs to be pushed back to javascript to handle.
- asyncio does not appear to block when awaiting async javascript in Pyodide therefore retrieving the list of tracked files was pushed to an init routine and results saved for later use.
- wordlist based on pyahocorasick appears to use C extensions which might be able to be explored if it can be built for Pyodide in the future.
- mounts the working directory to a directory in Pyodide environment so scans from the root of the project / current working directory; this filesystem mount is also likely to have a performance penalty.
- Python packages are downloaded every run into the Pyodide environment; another performance hit and network dependency.

Conclusion:

- This experiment has been helpful for learning but is fragile and not recommended for use.
