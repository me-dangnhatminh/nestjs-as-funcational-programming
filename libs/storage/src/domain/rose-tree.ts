// https://en.wikipedia.org/wiki/Rose_tree

export type Tree<T> = Leaf<T> | Node<T>;
export type Leaf<T> = { _tag: 'leaf'; value: T };
export type Node<T> = { _tag: 'node'; value: Tree<T>[] };

export const leaf = <T>(value: T): Leaf<T> =>
  Object.freeze({ _tag: 'leaf', value: Object.freeze(value) });
export const node = <T>(value: Tree<T>[]): Node<T> =>
  Object.freeze({ _tag: 'node', value });

export const isLeaf = <T>(tree: Tree<T>): tree is Leaf<T> =>
  tree._tag === 'leaf';
export const isNode = <T>(tree: Tree<T>): tree is Node<T> =>
  tree._tag === 'node';

export const findPre = <T>(
  predicate: (value: T) => boolean,
  tree: Tree<T>,
): T | null => {
  if (isLeaf(tree)) return predicate(tree.value) ? tree.value : null;
  const children = tree.value;
  for (const idx in children) {
    const value = findPre(predicate, children[idx]);
    if (value !== null) return value;
  }
  return null;
};

export const add = <T>(n: Node<T>, tree: Tree<T>): Node<T> =>
  Tree.node([...n.value, tree]);

export const Tree = {
  leaf,
  node,
  isLeaf,
  isNode,
  findPre,
  add,
} as const;

// implement builder pattern
