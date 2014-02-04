# Contributing

Want to help make Polyhedron.js even more awesome?  Great!  Here's what you need to know.

## Development Environment

You will need node installed as a development dependency. See node's site for help with that.

    npm install
    
 - git config settings: 
    - git config [--global] core.autocrlf false
    - post-commit
    - config origin block - push master & gh-pages
 - .editorconfig  

The project uses `npm run` as its task manager:

 - To build the library: `npm run build`
 - To run the tests: `npm run test`

## Development Guidelines

 - fork the repo, clone the project locally, and add the repo as upstream

        git clone git@github.com:fork-user/Polyhedron.js.git
        cd Polyhedron.js
        git add remote upstream git@github.com:marfarma/Polyhedron.js.git
        git checkout master
        git pull origin master

 - create a branch and make your changes. All functional code changes must include unit tests. _Unit tests are not required for documentation changes or for code changes that are only formatting or white space._

        git checkout -b my-new-feature
        $EDITOR file

 - commit changes

        git add -p
        git commit -m "my changes"

 - intermittently update with upstream changes:

        git checkout master
        git fetch upstream
        git rebase upstream/master
        git rebase origin/my-new-feature
        git push origin master
        git push origin my-new-feature

 - Before issuing your pull request:

    - Ensure all tests still pass (npm run test)
    - Ensure that your new code has test coverage (check out report/coverage/index.html after running tests)
    - Verify your code (npm run verify) (uses JSHint and JSBeautify to do linting and check style guidelines)

   
 - create pull request (and squash commits)

Create the pull request between the project (typically the master branch) and your fork's my-new-feature branch.  If you have more than two or three commits in your pull request, we may as you to squash your commits.  To squash commits:

        git fetch upstream master
        git checkout my-new-feature 
        git rebase -i upstream/master

< choose squash for all of your commits, except the first one >
< Edit the commit message to make sense, and describe all your changes >

```
        git push origin my-new-feature -f
``` 

The pull request will be automatically reflect the squashed commits, no need to delete and re-pull.
 
## Improving the Documentation

The documentation website is built from markdown files in the docs folder.

The rendering server, viewdocs.io, pulls content (markdown files) from the master branch, while other assets (images, js, css, etc.) are served from user.github.io, which serves from the gh-pages branch. 

It's a project convention to keep the gh-pages branch identical to the master branch.  If you want to preview changes made in your fork, make your changes in the master branch, and force the gh-pages branch to match.

It's easiest to use a post-commit hook and ...



