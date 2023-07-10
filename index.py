import asyncio
import argparse
import cloner_git
import os
import sys

os.chdir('/local_directory')
loop = asyncio.get_event_loop()

# Monkey patch subprocess
class sp:
  res = ''
  def check_output(args, cwd=None, stderr=None, stdin=None, stdout=None, shell=False, env=None):
    if ('rev-parse' in args):
      # Todo: do better
      return '/local_directory'.encode()
    return sp.res.encode()
  class CalledProcessError(Exception):
    "Exception from subprocess"
    pass
  DEVNULL = None
sys.modules['subprocess'] = sp

# Monkey patch multiprocessing
class Pool:
  def __init__(self, processes, initializer, initargs, maxtasksperchild=1, context=None):
    pass
  def __enter__(self):
    return self
  def __exit__(self, *args):
    return None
  def imap_unordered(self, func, args):
    return map(func, args)
class mp:
  Pool = Pool
  cpu_count = lambda: 1
sys.modules['multiprocessing'] = mp

# wrap promise
def wrap_promise(promise):
    loop = asyncio.get_event_loop()
    fut = loop.create_future()
    def set_exception(e):
      fu.set_exception(Exception(str(e)))
    promise.then(fut.set_result).catch(set_exception)
    return fut

# our main
async def run():
  # init: fetch git tracked files
  promise = cloner_git.lsFiles('/local_directory')
  res = await wrap_promise(promise)
  # save result for later use
  sys.modules['subprocess'].res = res

  # run detect-secrets
  from detect_secrets import main as detect_secrets
  try:
    foo = detect_secrets.main(['-C', '/local_directory', 'scan', '--no-verify'])
  except SystemExit as e:
    print(e)

# run main
asyncio.ensure_future(run())
loop.run_forever()
