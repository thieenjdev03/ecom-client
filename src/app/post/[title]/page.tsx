import { PostDetailsHomeView } from "src/sections/blog/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Post: Details",
};

type Props = {
  params: {
    title: string;
  };
};

export default function PostDetailsHomePage({ params }: Props) {
  const { title } = params;

  return <PostDetailsHomeView title={title} />;
}
