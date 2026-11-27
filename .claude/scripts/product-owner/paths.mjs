// The only files the product-owner agent may write and commit: product documentation, the course
// deliverables and the prompt log.
const FILES = ['readme.md', 'prompts.md'];
const FOLDERS = ['docs/product/', 'prompts/'];

// `path` is relative to the repository root.
export function isProductPath(path) {
  if (typeof path !== 'string' || path.split('/').some((part) => part === '..' || part === '.' || part === '')) {
    return false;
  }
  return FILES.includes(path) || FOLDERS.some((folder) => path.startsWith(folder));
}

export const PRODUCT_PATHS = [...FILES, ...FOLDERS].join(', ');
