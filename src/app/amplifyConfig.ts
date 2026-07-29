import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-northeast-1_y0Uf0LWje",
      userPoolClientId: "499gmh5rlbnqcdqi6ctjts4hk6",
      loginWith: {
        email: true,
      },
    },
  },
});