import { useQuery } from "@tanstack/react-query";

import { getStudents } from "./studentsService";
import type { DiscoverStudentsParams } from "./students.types";

export const useStudents = (params: DiscoverStudentsParams) => {
  const query = useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    students: query.data?.users ?? [],
    page: query.data?.page ?? 1,
    limit: query.data?.limit ?? 10,
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
