import api from "./axios";

import type {
  DiscoverStudentsParams,
  DiscoverStudentsResponse,
} from "../features/students/students.types";

export const discoverStudents = async (
  params: DiscoverStudentsParams
): Promise<DiscoverStudentsResponse> => {
  const { data } = await api.get<DiscoverStudentsResponse>(
    "/users/discover",
    {
      params,
    }
  );

  return data;
};
