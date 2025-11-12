import { TourDetailsView } from "src/sections/tour/view";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Dashboard: Tour Details",
};

type Props = {
  params: {
    id: string;
  };
};

export default function TourDetailsPage({ params }: Props) {
  const { id } = params;

  return <TourDetailsView id={id} />;
}
