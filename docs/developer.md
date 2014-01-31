# Hacking on Polyhedron.js

Want to help make Polyhedron.js even more awesome?  Great!

## Development Environment

 - Node
 - NPM
 - Browserify
 - Napa

## Documentation

The documentation website is built from markdown files in the docs folder.

The rendering server, viewdocs.io, pulls content (markdown files) from the master branch, while other assets (images, js, css, etc.) are served from user.github.io, which serves from the gh-pages branch. 

It's a project convention to keep the gh-pages branch identical to the master branch.  If you want to preview changes made in your fork, make your changes in the master branch, and force the gh-pages branch to match.

It's easiest to use a post-commit hook and ...

## Code Conventions

 - .editorconfig  
 - git.core.crlf
 - jshint

## Creating Pull Requests

Follow the a [simple git branching model](https://gist.github.com/jbenet/ee6c9ac48068889b0912) 
(see also: http://differential.io/blog/best-way-to-merge-a-github-pull-request)

Tests are required for all pull requests.  (Documentation and code formatting only changes excepted, of course.)

## Test

Tests are maintained in Mocha / Chai