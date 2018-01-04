#!/usr/bin/env bash
echo "Checking NPM Modules"

set -e
set -o pipefail

# calculate the md5 sum of the package.json and save it in the node_module directory
function calc_package_md5 {
  md5sum ./package.json  | awk '{print $1}' > ./node_modules/package_json_md5
}

# install / update dependencies only if necessary
function prepare {
  # ok, is there a node_modules folder?
  if [[ ! -d './node_modules' ]]; then
    yarn install
    calc_package_md5
    return
  fi

  # ok, node_modules folder there, but is there an old package_json_md5 file?
  if [[ ! -f './node_modules/package_json_md5' ]]; then
    yarn install
    calc_package_md5
    return
  fi

  # ok all is there, but did the package json update?
  if [[ "$(md5sum ./package.json  | awk '{print $1}')" != "$(cat ./node_modules/package_json_md5)" ]]; then
    calc_package_md5
    return
  fi
}

# install / update dependencies if necessary
prepare
# run the actual command given
# - use double quotes to prevent splitting of arguments with spaces
exec "$@"
