# slate-node-validator

`slate-node-validator` is a utility package for validating Slate.js objects. It ensures that the Slate content structure adheres to expected formats and provides detailed error messages for invalid nodes. This package is designed to help developers maintain the integrity of their Slate.js content by catching and reporting issues early.

## Features

- **Comprehensive Validation**: Validates Slate.js objects to ensure they are non-empty arrays and checks the structure of each node.
- **Detailed Error Reporting**: Provides detailed error messages, including user-friendly messages and specific node details such as node type, index, and path.
- **Path Tracking**: Tracks the path of invalid nodes to help pinpoint the exact location of issues within the Slate.js content.
- **User-Friendly Messages**: Offers user-friendly error messages to guide users in correcting content issues.
- **Node Type Identification**: Identifies and reports the type of invalid nodes, aiding in debugging and content correction.
- **Flexible Integration**: Easily integrates into existing Slate.js projects to enhance content validation and integrity.

## Installation

```bash
npm install slate-node-validator
```

## Usage
```js
import { validateSlateObject } from 'slate-node-validator';

const slateObject = [
  // Your Slate.js content here
];

const validationResult = validateSlateObject(slateObject);

if (!validationResult.isValid) {
  console.error(validationResult.error);
  // Handle validation error
}
```
## License
This project is licensed under the MIT License.
