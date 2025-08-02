import { useState } from "react";

export default function Base64Img() {
  const [img, setImage] = useState(null);
  const imgUri =
    "iVBORw0KGgoAAAANSUhEUgAABJMAAAMqCAIAAAC5c5fgAAAgAElEQVR4AezBeXDlW0If9u+5i3S1b62tj3bp3vvUrzVn3nMY248z2BmPHcoxMc6MxySphLhwHCgccBEPx6ZwYShSHP55GYeQjFPgkIQ4Y4eA7eLExAyLKR+bYXnzQD2tvot2qVtLa991lx";

  useEffect(() => {
    if (imgUri) {
      setImage(`data:image/png;base64,${imgUri}`);
    }
  }, []);

  return (
    <div>
      <img src={img} alt="image" />
    </div>
  );
}
