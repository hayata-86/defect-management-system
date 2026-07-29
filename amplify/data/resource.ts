import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

import { analyzeDefects } from "../functions/analyze-defects/resource";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.guest()]),

  AnalyzeDefectsResponse: a.customType({
    analysis: a.string(),
    error: a.string(),
  }),

  analyzeDefects: a
    .query()
    .arguments({
      prompt: a.string().required(),
    })
    .returns(a.ref("AnalyzeDefectsResponse"))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(analyzeDefects)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});