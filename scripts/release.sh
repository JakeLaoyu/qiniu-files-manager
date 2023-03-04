#! /bin/bash

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")

if [[ -z $1 ]]; then
  echo "Enter new version (currently $PACKAGE_VERSION): "
  read VERSION
else
  VERSION=$1
fi

if [ $VERSION = $PACKAGE_VERSION ]; then
  echo "No version change, exiting"
  exit 1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r

echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo
  echo "* * * * * * * Releasing $VERSION * * * * * * *"
  echo

  # update package.json version to be used in the build
  npm version $VERSION --git-tag-version false

  cd ./packages/server
  npm version $VERSION --git-tag-version false

  cd ../client
  npm version $VERSION --git-tag-version false

  cd ../..

  # push
  # git push origin refs/tags/v$VERSION
  git add .
  git commit -m "release: $VERSION"
  git push

  git checkout -b release/$VERSION
  git push --set-upstream origin release/$VERSION
fi
