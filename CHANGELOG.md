Changelog
=========

### `v0.4.3` 2018-01-22

 * Feature: Add additional parameter object to all methods to supple path to binary, 
   the feature was there but not really usable as implemented previously.
 * Dependencies: node-7zip-standalone: branch depends on 7zip-standalone which has all platform
   binary embedded, and adds itself to environment path. Host system no longer needs
   7zip installed. 
   
### `v0.4.2` **CURRENT**

 * Fix: `run` returns useful error from stderr (#31)
 * Doc: It's better with the correct verbs (commit 7c0355beea59c42e040d0e776ff945be94705a74)
 * Dependencies: Switch to cross-spawn and update other dependencies (#29)

### `v0.4.1` 2016-01-13

 * Fix: `Zip.list` will no longer ignore files with blank `Compressed` columns (#14)

### `v0.4.0` 2015-12-06

 * Feature: Add a `raw` parameter to the `options` object. Given
   values are *Array* (e.g. `[ '-i!*.png', '-i*.jpg' ]`).
 * Feature: Add support for `.rar` archives.
 * Fix: Bug with `Zip.list` sometimes occurs (commit
   748091463961110449e63d7ea6b9628749104f15).

### `v0.3.0` 2015-02-06

 * Feature: Add a `wildcards` parameter to the `options` object. Given
   wildcards are *Array* (e.g. `[ '*.txt', '*.md' ]`).

### `v0.2.0` 2014-10-24

 * Feature: Methods `Zip.add`, `Zip.delete` and `Zip.update` can get either a
   *String* or an *Array* as `files` parameter.

### `v0.1.3` 2014-10-23

 * Fix: Support for Windows platform.

### `v0.1.2` 2014-10-20

 * Fix: Now support paths with spaces.

### `v0.1.1` 2014-08-26

 * Doc: Fix wrong usage in documentation.

### `v0.1.0` 2014-08-26

 * Feature: Add: `Zip.add`.
 * Feature: Delete: `Zip.delete`.
 * Feature: Update: `Zip.update`.
 * Dependencies: Use `7za` instead of `7z` so it is easier to setup on Windows.

### `v0.0.2` 2014-08-25

 * Feature: List contents of archive: `Zip.list`.
 * Feature: Test integrity of archive: `Zip.test`.

### `v0.0.1` 2014-08-25

 * Initial release.
 * Feature: Extract with full paths: `Zip.extractFull`
 * Feature: Extract: `Zip.extract`.

> Dates are in *ISO 8601* format (year-month-day)
