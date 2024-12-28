import { TreeNodeEvent } from "common/models";
import { ReportCollection, NODE_TYPES, ReportDocument } from "common/models/reports";
import { TreeNode } from "primereact/treenode";

export const buildTreeNodes = (collectionsData: ReportCollection[]): TreeNode[] => {
    return collectionsData
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((col) => {
            let children: TreeNode[] = [];
            if (col.collections && col.collections.length) {
                children = children.concat(buildTreeNodes(col.collections));
            }
            if (col.documents && col.documents.length) {
                const docNodes = col.documents
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((doc) => ({
                        key: doc.itemUID,
                        label: doc.name,
                        type: NODE_TYPES.DOCUMENT,

                        data: {
                            type: NODE_TYPES.DOCUMENT,
                            document: doc,
                            collectionId: col.itemUID,
                            order: doc.order,
                            parentCollectionUID: col.itemUID,
                        },
                    }));
                children = children.concat(docNodes);
            }
            return {
                key: col.itemUID,
                label: col.name,
                type: NODE_TYPES.COLLECTION,
                data: {
                    type: NODE_TYPES.COLLECTION,
                    collectionId: col.itemUID,
                    parentCollectionUID: col.itemUID,
                    collection: col,
                    order: col.order,
                },
                children,
            };
        });
};

export const convertTreeNodesToCollections = (
    nodes: TreeNodeEvent[],
    parentCollection?: ReportCollection
): ReportCollection[] => {
    return nodes.map((node, index) => {
        const data = node.data || {};
        const isCollection = node.type === NODE_TYPES.COLLECTION;
        if (isCollection) {
            const collectionData: ReportCollection = {
                ...data.collection,
                order: index,
                documents: [],
                collections: data.collection?.collections || [],
            };
            if (node.children && node.children.length) {
                const docs: ReportDocument[] = [];
                const cols: ReportCollection[] = [];
                node.children.forEach((children, i) => {
                    const child = children as TreeNodeEvent;
                    if (child.type === NODE_TYPES.DOCUMENT) {
                        const docData = child.data || {};
                        docs.push({
                            ...docData.document,
                            order: i,
                        });
                    } else if (child.type === NODE_TYPES.COLLECTION) {
                        const subCols = convertTreeNodesToCollections([child], collectionData);
                        cols.push(...subCols);
                    }
                });
                collectionData.documents = docs;
                collectionData.collections = cols;
            }
            return collectionData;
        } else {
            return parentCollection!;
        }
    });
};
