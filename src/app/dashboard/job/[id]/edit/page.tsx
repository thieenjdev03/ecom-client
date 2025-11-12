import { JobEditView } from "src/sections/job/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Job Edit",
};

type Props = {
  params: {
    id: string;
  };
};

export default function JobEditPage({ params }: Props) {
  const { id } = params;

  return <JobEditView id={id} />;
}
