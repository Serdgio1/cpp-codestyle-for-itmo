# Change Log

All notable changes to the `cpp-codestyle-for-itmo` extension will be documented in this file.

This project adheres to "Keep a Changelog" and uses Semantic Versioning.
See http://keepachangelog.com/ for details.

## [Unreleased]

- Improvements and fixes to be released.

## [0.0.4] - 2025-01-28

### Added
- **Struct and class naming**: Automatically converts struct and class names to UpperCamelCase
- **Comprehensive constant naming**:
  - Macros (`#define`): Converts to UPPER_SNAKE_CASE
  - Global/static/constexpr constants: Converts to k + CamelCase format
  - Local constants: Converts to camelCase format
- **Automatic renaming propagation**: All renamed structs, classes, and constants are automatically updated throughout the entire codebase
- **Enhanced line length enforcement**: Lines longer than 120 characters are automatically truncated with a comment marker

### Improved
- Better handling of struct and class definitions with proper word boundary matching
- More reliable constant detection and renaming across different scopes
- Improved dictionary-based renaming system to handle structs, classes, and constants

## [0.0.3] - 2025-01-27

### Added
- **Dictionary-based renaming system**: All renamed functions and constants are now collected in a dictionary and automatically applied to all usages throughout the code
- **Comprehensive usage tracking**: The extension now tracks and replaces all occurrences of renamed identifiers, not just declarations
- **Enhanced feedback**: Shows both the number of renamed elements and the total number of changes applied

### Improved
- More reliable renaming that ensures consistency across the entire codebase
- Better handling of function calls and variable references
- Word boundary matching to prevent partial replacements

## [0.0.2] - 2025-10-27

### Added
- Complete C++ Google Style Guide implementation for ITMO
- Function naming: UpperCamelCase (except `main` function)
- If statement formatting: single-line to multi-line conversion
- Multi-line if conditions with proper indentation (80+ characters)
- Constant naming conventions:
  - Macros: UPPER_SNAKE_CASE
  - Global/static/constexpr: k + CamelCase
  - Local constants: camelCase
- Normalization of if spacing: `if()` → `if ()`
- Comprehensive handling of `else if` and `else` statements
- Fix for double semicolons and proper formatting

### Fixed
- `else if` no longer renamed to `else If`
- Proper handling of `if () {statement;}` → `if () { \n statement; \n }`
- Fixed `else {statement;}` → `else { \n statement; \n }`
- Better handling of statements without semicolons

## [0.0.1] - 2025-10-21

- Initial release