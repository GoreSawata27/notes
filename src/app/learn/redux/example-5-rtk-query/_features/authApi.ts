import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

const baseUrl = "/learn/redux/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders(headers, { getState }) {
      const state = getState() as { authSession?: { token: string | null } };
      const token = state.authSession?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "mock-auth",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => "mock-me",
      providesTags: ["Me"],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
