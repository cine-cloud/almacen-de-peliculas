export const oidcConfig = {
    authority: "http://localhost:9090/realms/cinecloud",
    client_id: "cinecloud-frontend",
    redirect_uri: "http://localhost:5173",
    response_type: "code",
    scope: "openid profile email"
  };