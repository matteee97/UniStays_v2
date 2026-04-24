import { useEffect, useState } from "react";
import useInView from "./useInView";

export default function useDeferredInView(options) {
  const [ref, isVisible] = useInView(options);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setHasEnteredView(true);
    }
  }, [isVisible]);

  return [ref, hasEnteredView, isVisible];
}
