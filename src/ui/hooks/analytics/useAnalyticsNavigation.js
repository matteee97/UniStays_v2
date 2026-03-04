import { useNavigate } from "react-router-dom";

export const useAnalyticsNavigation = () => {
  const navigate = useNavigate();

  const handleBarClick = (data) => {
    if (data && data.id) {
      navigate(`/alloggi/${data.address?.city.trim().toLowerCase()}-${data.address?.provinceCode.trim().toLowerCase()}/${data.id}`);
    }
  };

  return { handleBarClick };
};
