import { PostEditView } from "src/sections/blog/view";

// ----------------------------------------------------------------------
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata = {
  title: "Dashboard: Post Edit",
};

type Props = {
  params: {
    title: string;
  };
};

export default function PostEditPage({ params }: Props) {
  const { title } = params;

  return <PostEditView title={title} />;
}
