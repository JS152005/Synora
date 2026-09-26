import { discoverStudents } from "../../api/students.api";

import type {
  DiscoverStudentsParams,
  DiscoverStudentsResponse,
} from "./students.types";

export const getStudents = async (
  params: DiscoverStudentsParams
): Promise<DiscoverStudentsResponse> => {
  return discoverStudents(params);
};
