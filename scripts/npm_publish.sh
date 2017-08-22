#!/bin/bash
# Any subsequent(*) commands which fail will cause the shell script to exit immediately
set -e

usage ()
{
  echo "usage: ./npm_publish.sh [NPM_TOKEN]"
}

npm_token=""

while [ "$1" != "" ]; do
  case $1 in
    * )           if [ -z $npm_token ]; then
                    npm_token=$1
                  else
                    echo "'NPM_TOKEN' already provided"
                    usage
                    exit 1
                  fi
                  ;;
  esac
  shift
done

NPMRC_FILE="$HOME/.npmrc"
NPMRC_BAK_FILE="$HOME/.npmrc.bak"

if [ -f $NPMRC_FILE ]; then
  if [ -z $npm_token ]; then
    echo "Using existing npm credentials from '$NPMRC_FILE'."
  else
    echo "Using given npm credentials, existing '$NPMRC_FILE' backed up to '$NPMRC_BAK_FILE'."
    eval "mv $NPMRC_FILE $NPMRC_BAK_FILE"
    echo "//registry.npmjs.org/:_authToken=$npm_token" > $NPMRC_FILE
  fi
else
  if [ -z $npm_token ]; then
    echo "No npm credentials found."
    usage
    exit 1
  else
    echo "Using given npm credentials."
    echo "//registry.npmjs.org/:_authToken=$npm_token" > $NPMRC_FILE
  fi
fi


# Make sure we are at the root directory of the repository
cd ${BASH_SOURCE%/*}/..

packages=$(ls -1 ./packages)

for package in $packages; do
  pushd ./packages/$package > /dev/null
  npm publish
  popd > /dev/null
done

if [ -f "$NPMRC_BAK_FILE" ]; then
  if [ -f "$NPMRC_FILE" ]; then
    eval "rm $NPMRC_FILE"
  fi
  eval "cp $NPMRC_BAK_FILE $NPMRC_FILE"
fi
