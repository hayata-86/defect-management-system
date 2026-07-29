import { api } from "./api";
import type {
  DefectDetail,
  DefectFormValues,
} from "../types/defect";

type CreateDefectRequest = DefectFormValues & {
  registeredAt: string;
  updatedAt: string;
};

type UpdateDefectRequest = DefectFormValues & {
  updatedAt: string;
};

export async function getDefects(): Promise<
  DefectDetail[]
> {
  const response =
    await api.get<DefectDetail[]>("/defects");

  return response.data;
}

export async function getDefect(
  id: string,
): Promise<DefectDetail> {
  const response =
    await api.get<DefectDetail>(`/defects/${id}`);

  return response.data;
}

export async function createDefect(
  values: DefectFormValues,
): Promise<DefectDetail> {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const request: CreateDefectRequest = {
    ...values,
    registeredAt: today,
    updatedAt: today,
  };

  const response =
    await api.post<DefectDetail>(
      "/defects",
      request,
    );

  return response.data;
}

export async function updateDefect(
  id: string,
  values: DefectFormValues,
): Promise<DefectDetail> {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const request: UpdateDefectRequest = {
    ...values,
    updatedAt: today,
  };

  const response =
    await api.patch<DefectDetail>(
      `/defects/${id}`,
      request,
    );

  return response.data;
}

export async function deleteDefect(
  id: string,
): Promise<void> {
  await api.delete(`/defects/${id}`);
}