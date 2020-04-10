yarn version --no-git-tag-version &&
cp package.json README.md src/ &&

pushd `pwd` && # store current dir
cd src &&

yarn publish --non-interactive --no-git-tag-version &&
rm package.json README.md

popd # return to original dir

