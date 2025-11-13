import { usePathname } from "next/navigation";

// ----------------------------------------------------------------------

type ReturnType = boolean;

export function useActiveLink(path: string, deep = true): ReturnType {
  const pathname = usePathname();

  const checkPath = path.startsWith("#");

  const currentPath = path === "/" ? "/" : `${path}/`;

  const normalActive = !checkPath && pathname !== null && pathname === currentPath;

  const deepActive = !checkPath && pathname !== null && pathname.includes(currentPath);

  return deep ? deepActive : normalActive;
}
