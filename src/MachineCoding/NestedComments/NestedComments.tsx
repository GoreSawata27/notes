type comment = {
  id: number;
  text: string;
  children?: comment[];
};

export default function NestedComments({ comments }: { comments: comment[] }) {
  const renderComments = (item: comment[]) => {
    return (
      <ul>
        {item.map((comment) => (
          <li key={comment.id}>
            <span>{comment.text}</span>
            {comment.children && renderComments(comment.children)}
          </li>
        ))}
      </ul>
    );
  };

  return <div>{renderComments(comments)}</div>;
}
