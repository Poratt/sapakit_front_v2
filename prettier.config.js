/** @type {import("prettier").Config} */
module.exports = {
  semi: true,             // Add semicolons at the end of statements
  singleQuote: true,      // Use single quotes instead of double quotes
  tabWidth: 4,            // Number of spaces per indentation level
  useTabs: true,          // Use tabs instead of spaces for indentation
  trailingComma: 'all',   // Add a comma after the last item in objects, arrays, etc.
  bracketSpacing: true,   // Add spaces inside curly braces: { foo: bar }
  printWidth: 100,        // Wrap lines that exceed 100 characters
  arrowParens: 'always',  // Always include parentheses around arrow function parameters
};
