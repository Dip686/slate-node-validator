import { Text, Element } from 'slate';
import {
  SLATE_DATA,
  EMPTY_CONTENT,
  INVALID_CONTENT,
  INVALID_STRUCTURE,
  UNSUPPORTED_NODE,
  TEXT_NODE_TYPE
} from './constants.js';

/**
 * Validates the slate object
 * @param {array} slateObject slate object content that needs to be validated
 * @returns true if the object is working as expected, otherwise failured details
 */
function validateSlateObject (slateObject) {
  if (!Array.isArray(slateObject) || slateObject.length === 0) {
    return {
      isValid: false,
      error: 'Slate object should be a non-empty array.',
      errorKey: `${SLATE_DATA}_${EMPTY_CONTENT}`,
      userFriendlyMessage: 'The content seems to be empty. Please add some content and try again.',
      nodeType: null,
      nodeIndex: null,
      path: []
    };
  }

  /**
   * @param {object} node object with specific details about each slate element
   * @param {array} path path details for the node
   * @returns invalid node details
   */
  function validateNode (node, path = []) {
    if (Text.isText(node)) {
      if (typeof node.text !== 'string') {
        return {
          isValid: false,
          error: `Text node at path ${path.join(' > ')} has an invalid 'text' property.`,
          errorKey: `${TEXT_NODE_TYPE}_${INVALID_CONTENT}`,
          userFriendlyMessage: 'There is an issue with the text content. Please review the text and try again.',
          nodeType: TEXT_NODE_TYPE,
          path
        };
      }

      const validMarks = ['bold', 'italic', 'underline', 'strikethrough', 'code'];
      for (let mark in node) {
        if (mark !== 'text' && !validMarks.includes(mark)) {
          return {
            isValid: false,
            error: `Text node at path ${path.join(' > ')} has an invalid mark '${mark}'.`,
            errorKey: `${TEXT_NODE_TYPE}_${mark}_${INVALID_CONTENT}`,
            userFriendlyMessage: `There is an unsupported text style: '${mark}'. Please remove or correct it.`,
            nodeType: TEXT_NODE_TYPE,
            path
          };
        }
      }
      return { isValid: true };
    }

    if (Element.isElement(node)) {
      // Check for empty elements that should have children
      const emptyElements = ['ul', 'ol', 'li', 'code_block', 'table', 'tr'];
      if (emptyElements.includes(node.type) && node.children.length === 0) {
        return {
          isValid: false,
          error: `${node.type} at path ${path.join(' > ')} should not be empty.`,
          errorKey: `${node.type}_${EMPTY_CONTENT}`,
          userFriendlyMessage: `The ${node.type.replace('_', ' ')} should contain content. Please add content inside the ${node.type.replace('_', ' ')}.`,
          nodeType: node.type,
          path
        };
      }

      switch (node.type) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
        case 'p':
        case 'blockquote':
          for (let i = 0; i < node.children.length; i++) {
            const result = validateNode(node.children[i], [...path, `${node.type}[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'ul':
        case 'ol':
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].type !== 'li') {
              return {
                isValid: false,
                errorKey: `${node.type}_${INVALID_STRUCTURE}`,
                error: `List (${node.type}) at path ${path.join(' > ')} has an invalid child type '${node.children[i].type}' (expected 'li').`,
                userFriendlyMessage: 'There is an issue with the list structure. Please review and correct the list items.',
                nodeType: node.type,
                path: [...path, `${node.type}[${i}]`]
              };
            }
            const result = validateNode(node.children[i], [...path, `${node.type}[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'lic':
          for (let i = 0; i < node.children.length; i++) {
            const result = validateNode(node.children[i], [...path, `lic[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'table':
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].type !== 'tr') {
              return {
                isValid: false,
                errorKey: `${node.type}_${INVALID_STRUCTURE}`,
                error: `Table at path ${path.join(' > ')} has an invalid child type '${node.children[i].type}' (expected 'tr').`,
                userFriendlyMessage: 'The table structure seems to have an issue. Please check the rows and columns.',
                nodeType: node.type,
                path: [...path, `${node.type}[${i}]`]
              };
            }
            const result = validateNode(node.children[i], [...path, `${node.type}[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'tr':
          for (let i = 0; i < node.children.length; i++) {
            const cellType = node.children[i].type;
            if (!['th', 'td'].includes(cellType)) {
              return {
                isValid: false,
                errorKey: `${node.type}_${INVALID_STRUCTURE}`,
                error: `Table row (tr) at path ${path.join(' > ')} has an invalid child type '${cellType}' (expected 'th' or 'td').`,
                userFriendlyMessage: 'There seems to be an issue with the table cells. Please ensure the cells are correct.',
                nodeType: node.type,
                path: [...path, `tr[${i}]`]
              };
            }
            const result = validateNode(node.children[i], [...path, `tr[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'th':
        case 'td':
          for (let i = 0; i < node.children.length; i++) {
            const result = validateNode(node.children[i], [...path, `${node.type}[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'img':
          if (typeof node.url !== 'string' || typeof Number(node.width) !== 'number' || typeof Number(node.height) !== 'number') {
            return {
              isValid: false,
              errorKey: `${node.type}_${INVALID_CONTENT}`,
              error: `Image (img) at path ${path.join(' > ')} has invalid 'url', 'width', or 'height' properties.`,
              userFriendlyMessage: 'There is an issue with the image properties. Please ensure the image URL and dimensions are correct.',
              nodeType: node.type,
              path
            };
          }
          break;

        case 'a':
          if (typeof node.url !== 'string') {
            return {
              isValid: false,
              errorKey: `${node.type}_${INVALID_CONTENT}`,
              error: `Link (a) at path ${path.join(' > ')} has an invalid 'url' property.`,
              userFriendlyMessage: 'There is an issue with the link URL. Please ensure it is correct.',
              nodeType: node.type,
              path
            };
          }
          for (let i = 0; i < node.children.length; i++) {
            const result = validateNode(node.children[i], [...path, `a[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'code_block':
          if (node.children.length === 0) {
            return {
              isValid: false,
              errorKey: `${node.type}_${EMPTY_CONTENT}`,
              error: `Code block (code_block) at path ${path.join(' > ')} should not be empty.`,
              userFriendlyMessage: 'The code block should contain code. Please add some code to the block.',
              nodeType: node.type,
              path
            };
          }
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].type !== 'code_line') {
              return {
                isValid: false,
                errorKey: `${node.type}_${INVALID_STRUCTURE}`,
                error: `Code block (code_block) at path ${path.join(' > ')} has an invalid child type '${node.children[i].type}' (expected 'code_line').`,
                userFriendlyMessage: 'There is an issue with the code block structure. Please ensure the code is properly formatted.',
                nodeType: node.type,
                path: [...path, `code_block[${i}]`]
              };
            }
            const result = validateNode(node.children[i], [...path, `code_block[${i}]`]);
            if (!result.isValid) return result;
          }
          break;

        case 'code_line':
          for (let i = 0; i < node.children.length; i++) {
            const result = validateNode(node.children[i], [...path, `code_line[${i}]`]);
            if (!result.isValid) return result;
          }
          break;
      }
      return { isValid: true };
    }

    return {
      isValid: false,
      errorKey: `${UNSUPPORTED_NODE}_${node.type}`,
      error: `Invalid node type at path ${path.join(' > ')}.`,
      userFriendlyMessage: 'There is an issue with the content structure. Please review the content and try again.',
      nodeType: null,
      path
    };
  }

  for (let i = 0; i < slateObject.length; i++) {
    const result = validateNode(slateObject[i], [`root[${i}]`]);
    if (!result.isValid) return result;
  }

  return { isValid: true };
}

export {
  validateSlateObject
};