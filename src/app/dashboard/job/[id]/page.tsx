import { JobDetailsView } from "src/sections/job/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Job Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function JobDetailsPage({ params }: Props) {
  const { id } = params;

  return <JobDetailsView id={id} />;
}
