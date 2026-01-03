import { useState } from "react";

type Comment = {
  id: number;
  text: string;
  children?: Comment[];
};

let nextId = 5;

export default function NestedComments({ comments }: { comments: Comment[] }) {
  const [allComments, setAllComments] = useState<Comment[]>(comments);
  const [commentText, setCommentText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState<number | null>(null);

  const addReply = (parentId: number, text: string) => {
    const newComment: Comment = { id: nextId++, text };

    const addRecursively = (nodes: Comment[]): Comment[] =>
      nodes.map((node) =>
        node.id === parentId
          ? { ...node, children: [...(node.children || []), newComment] }
          : { ...node, children: node.children ? addRecursively(node.children) : undefined }
      );

    setAllComments((prev) => addRecursively(prev));
  };

  const renderComments = (items: Comment[]) => {
    return (
      <ul className="ml-4 p-4 ">
        {items.map((comment) => (
          <li key={comment.id}>
            <span className=" p-4">
              {comment.text}
              <button onClick={() => setShowReplyInput(comment.id)}>Reply</button>
              {showReplyInput === comment.id && (
                <>
                  <input
                    type="text"
                    className="outline"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button onClick={() => addReply(comment.id, commentText)}>Add Reply</button>
                  <button onClick={() => setShowReplyInput(null)}>Cancel</button>
                </>
              )}
            </span>
            {comment.children && renderComments(comment.children)}
          </li>
        ))}
      </ul>
    );
  };

  return <div>{renderComments(allComments)}</div>;
}
