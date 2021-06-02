# Directus Changelog Generator

Pulls up all closed pull requests in a given milestone, and generates a markdown
file that can be used as the release notes.

Everything is very hardcoded to the structure we use for
[Directus](https://github.com/directus/directus), but could be made more
flexible down the line.

## Installation

Clone this repo

## Usage

```
$ ./index.js v9.0.0-rc.71
```

## To-Do

Things we could update to make this a flexible tool for any project:

- [ ] Configurable labels
- [ ] Allow PR retrieval based on labels instead of milestone

## License (MIT)

Copyright (c) 2021 Rijk van Zanten

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
