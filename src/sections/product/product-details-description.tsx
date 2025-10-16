import Markdown from "src/components/markdown";

// ----------------------------------------------------------------------

type Props = {
  description: string;
};

export default function ProductDetailsDescription({ description }: Props) {
  return (
    <Markdown
      children={
        "Page layouts look better with something in each section. Web page designers, content writers, and layout artists use lorem ipsum, also known as placeholder copy, to distinguish which areas on a page will hold advertisements, editorials, and filler before the final written content and website designs receive client approval."
      }
      sx={{
        p: 3,
        "& p, li, ol": {
          typography: "body2",
        },
        "& ol": {
          p: 0,
          display: { md: "flex" },
          listStyleType: "none",
          "& li": {
            "&:first-of-type": {
              minWidth: 240,
              mb: { xs: 0.5, md: 0 },
            },
          },
        },
      }}
    />
  );
}
